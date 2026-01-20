import { serve } from 'bun';
import { type ErrorHandler, Hono, type MiddlewareHandler, type NotFoundHandler } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';
import pino, { type Logger } from 'pino';
import pretty from 'pino-pretty';
import { z } from 'zod';
import { createErrorHandler } from './middleware/createErrorHandler';
import { createLoggerMiddleware } from './middleware/createLoggerMiddleware';
import { createRequestTrackingMiddleware } from './middleware/createRequestTrackingMiddleware';
import type {
    AppEnv,
    CORSOptions,
    HttpAppParams,
    HttpServerLifecycleHooks,
    HttpServerStartOptions,
    HttpServerStartResult,
    SecureHeadersOptions,
} from './types';

const defaultNoFoundHandler: NotFoundHandler = (_c) => {
    throw new HTTPException(404, { message: 'Not found' });
};

export class HttpApp<T extends AppEnv = AppEnv> {
    protected honoApp: Hono<T>;
    protected logger: Logger;
    protected middlewareCollection: MiddlewareHandler[];
    protected routePrefix: string;
    protected routes: Hono<T>;
    protected errorHandler: ErrorHandler;
    protected notFoundHandler?: NotFoundHandler<T>;
    protected lifecycleHooks?: HttpServerLifecycleHooks;
    protected requestTrackingRegistered = false;
    protected defaultMiddlewareApplied = false;

    constructor(httpAppParams: HttpAppParams<T>) {
        validateHttpAppParams(httpAppParams);
        this.logger = this.createLogger(httpAppParams);
        this.honoApp = this.createHonoApp(httpAppParams);
        this.routes = httpAppParams.routes;
        this.middlewareCollection = [...(httpAppParams.middlewareCollection ?? [])];
        this.errorHandler = httpAppParams.errorHandler ?? createErrorHandler(this.logger);
        this.notFoundHandler = httpAppParams.notFoundHandler ?? defaultNoFoundHandler;
        this.routePrefix = httpAppParams.routePrefix ?? '/';
        this.lifecycleHooks = httpAppParams.lifecycleHooks;
    }

    withDefaultMiddleware({
        corsOptions,
        secureHeadersOptions,
    }: {
        corsOptions?: CORSOptions;
        secureHeadersOptions?: SecureHeadersOptions;
    } = {}): HttpApp<T> {
        if (this.defaultMiddlewareApplied) {
            return this;
        }

        this.defaultMiddlewareApplied = true;
        this.addTrimTrailingSlash();
        this.addRequestTracking();
        this.addCors(corsOptions);
        this.addSecureHeaders(secureHeadersOptions);
        this.addRequestLogger();

        return this;
    }

    addTrimTrailingSlash(): HttpApp<T> {
        return this.appendMiddleware(trimTrailingSlash());
    }

    addRequestTracking(): HttpApp<T> {
        if (this.requestTrackingRegistered) {
            return this;
        }

        this.requestTrackingRegistered = true;
        return this.appendMiddleware(createRequestTrackingMiddleware());
    }

    addCors(options?: CORSOptions): HttpApp<T> {
        const corsOptions = options ?? DEFAULT_CORS_OPTIONS;
        return this.appendMiddleware(cors(corsOptions));
    }

    addSecureHeaders(options?: SecureHeadersOptions): HttpApp<T> {
        return this.appendMiddleware(
            secureHeaders(
                options ?? {
                    contentSecurityPolicy: {
                        defaultSrc: ["'self'"],
                    },
                    crossOriginEmbedderPolicy: false,
                }
            )
        );
    }

    addRequestLogger(): HttpApp<T> {
        if (!this.requestTrackingRegistered) {
            this.addRequestTracking();
        }

        return this.appendMiddleware(createLoggerMiddleware(this.logger));
    }

    async startServer({
        hostname,
        port,
        lifecycleHooks,
        serverFactory,
    }: HttpServerStartOptions<T>): Promise<HttpServerStartResult> {
        const serveImpl = serverFactory ?? serve;
        const hooks = lifecycleHooks ?? this.lifecycleHooks;
        await hooks?.beforeStart?.();

        const server = serveImpl({
            hostname,
            port,
            fetch: this.honoApp.fetch,
        });

        await hooks?.afterStart?.({ server });

        const stop = async (reason?: string) => {
            await hooks?.beforeStop?.({ server, reason });
            await server.stop();
            await hooks?.afterStop?.({ reason });
        };

        return { server, stop };
    }

    async start(options: HttpServerStartOptions<T>): Promise<HttpServerStartResult> {
        return this.startServer(options);
    }

    init(): Hono<T> {
        const middlewareToRegister = [...this.middlewareCollection];
        if (middlewareToRegister.length > 0) {
            this.honoApp.use(...middlewareToRegister);
        }
        this.honoApp.onError(this.errorHandler);
        if (this.notFoundHandler) {
            this.honoApp.notFound(this.notFoundHandler);
        }
        this.honoApp.route(this.routePrefix, this.routes);

        return this.honoApp;
    }

    protected createLogger({ name, logger }: HttpAppParams<T>): Logger {
        if (logger) {
            return logger;
        }

        return pino(pretty()).child({ module: name });
    }

    protected createHonoApp({ honoApp }: HttpAppParams<T>): Hono<T> {
        return honoApp ?? (new Hono<T>() as Hono<T>);
    }

    private appendMiddleware(handler: MiddlewareHandler): HttpApp<T> {
        this.middlewareCollection = [...this.middlewareCollection, handler];
        return this;
    }
}

const honoInstanceSchema = z.instanceof(Hono, {
    message: 'HttpApp requires a valid Hono instance.',
});

const middlewareHandlerSchema = z.custom<MiddlewareHandler>(
    (value): value is MiddlewareHandler => typeof value === 'function',
    'Middleware handlers must be functions.'
);

const httpAppParamsSchema = z
    .object({
        name: z.string().min(1, 'HttpApp name is required.'),
        routes: honoInstanceSchema,
        routePrefix: z.string().optional(),
        honoApp: honoInstanceSchema.optional(),
        logger: z.any().optional(),
        errorHandler: z.any().optional(),
        middlewareCollection: z.array(middlewareHandlerSchema).optional(),
        notFoundHandler: z.any().optional(),
        lifecycleHooks: z.any().optional(),
    })
    .strict();

const validateHttpAppParams = <T extends AppEnv>(params: HttpAppParams<T>): void => {
    httpAppParamsSchema.parse(params);
};

const DEFAULT_CORS_OPTIONS: CORSOptions = {
    origin: ['*'],
};
