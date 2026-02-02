import type { Context, MiddlewareHandler } from 'hono';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Logger } from 'pino';

import { createErrorHandler } from '../errors/errorHandler';
import { errorEnvelope, successEnvelope } from '../errors/responseEnvelopes';
import { buildRouteInputs } from '../routing/registerRoutes';
import type { RouteInputSchemas, RouteInputs } from '../routing/route';
import { validateResponseData } from '../validation/responseValidation';
import { getRequestId } from './getRequestId';
import type { NormalizedRouteDefinition } from './RoutesCollection';
import { RoutesCollection } from './RoutesCollection';
import type {
    AppEnv,
    AuthConfig,
    HttpServerLifecycleHooks,
    HttpServerStartOptions,
    HttpServerStartResult,
    RoutesInput,
} from './types';

export type HonoServerParams<T extends AppEnv = AppEnv> = {
    name: string;
    routes?: RoutesInput;
    routePrefix?: string;
    logger?: Logger;
    middlewareCollection?: MiddlewareHandler<T>[];
    errorHandler?: Parameters<Hono<T>['onError']>[0];
    notFoundHandler?: Parameters<Hono<T>['notFound']>[0];
    lifecycleHooks?: HttpServerLifecycleHooks<T>;
    auth?: AuthConfig<T>;
    isDevelopment?: boolean;
    honoApp?: Hono<T>;
};

const joinPaths = (prefix: string | undefined, path: string): string => {
    if (!prefix) {
        return path;
    }

    const normalizedPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (!normalizedPrefix) {
        return normalizedPath || '/';
    }

    return `${normalizedPrefix}${normalizedPath}`;
};

const isJsonResponse = (response: Response): boolean => {
    const contentType = response.headers.get('content-type') ?? '';
    return contentType.includes('application/json') || contentType.includes('+json');
};

const assertJsonResponse = async (response: Response): Promise<unknown> => {
    try {
        return await response.clone().json();
    } catch {
        throw new HTTPException(500, { message: 'Invalid JSON response' });
    }
};

const shouldOmitBody = (status: number): boolean => status === 204 || status === 304;

export class HonoServer<T extends AppEnv = AppEnv> {
    readonly name: string;
    readonly app: Hono<T>;
    readonly routes: RoutesCollection;
    readonly logger?: Logger;

    protected routePrefix?: string;
    protected lifecycleHooks?: HttpServerLifecycleHooks<T>;
    protected auth?: AuthConfig<T>;

    constructor(params: HonoServerParams<T>) {
        this.name = params.name;
        this.logger = params.logger;
        this.routePrefix = params.routePrefix;
        this.lifecycleHooks = params.lifecycleHooks;
        this.auth = params.auth;
        this.app = params.honoApp ?? new Hono<T>();
        this.routes = new RoutesCollection();

        if (typeof params.isDevelopment === 'boolean') {
            this.app.use('*', async (c, next) => {
                c.set('isDevelopment', params.isDevelopment);
                await next();
            });
        }

        if (params.middlewareCollection && params.middlewareCollection.length > 0) {
            this.app.use('*', ...params.middlewareCollection);
        }

        this.app.onError(params.errorHandler ?? createErrorHandler());

        this.app.notFound(
            params.notFoundHandler ??
                ((c) =>
                    c.json(
                        errorEnvelope({
                            requestId: getRequestId(c),
                            statusCode: 404,
                            errorMessage: 'Not Found',
                        }),
                        404
                    ))
        );

        if (params.routes) {
            this.mount(params.routes);
        }
    }

    mount = (routes: RoutesInput): void => {
        const startIndex = this.routes.items.length;
        this.routes.add(routes);
        const newRoutes = this.routes.items.slice(startIndex);
        this.registerRoutes(newRoutes);
    };

    start = async (options: HttpServerStartOptions<T>): Promise<HttpServerStartResult> => {
        const lifecycleHooks = options.lifecycleHooks ?? this.lifecycleHooks;
        const serverFactory = options.serverFactory ?? Bun.serve;

        if (lifecycleHooks?.beforeStart) {
            await lifecycleHooks.beforeStart();
        }

        const server = serverFactory({
            hostname: options.hostname,
            port: options.port,
            fetch: this.app.fetch,
        });

        if (lifecycleHooks?.afterStart) {
            await lifecycleHooks.afterStart({ app: this.app, server, logger: this.logger });
        }

        const stop = async (reason?: string) => {
            if (lifecycleHooks?.beforeStop) {
                await lifecycleHooks.beforeStop({ app: this.app, server, logger: this.logger, reason });
            }

            if ('stop' in server && typeof server.stop === 'function') {
                server.stop();
            }

            if (lifecycleHooks?.afterStop) {
                await lifecycleHooks.afterStop({ app: this.app, logger: this.logger, reason });
            }
        };

        return { server, stop };
    };

    protected registerRoutes = (routes: NormalizedRouteDefinition[]): void => {
        const register = this.app.on.bind(this.app) as (
            method: string,
            path: string,
            ...handlers: MiddlewareHandler<T>[]
        ) => void;

        for (const route of routes) {
            const path = joinPaths(this.routePrefix, route.path);
            const middlewares = this.getRouteMiddlewares(route);

            register(route.method, path, ...middlewares, async (c) => {
                const input = await buildRouteInputs(c as Context<T>, route.schemas);
                return this.handleRoute({ route, input, context: c as Context<T> });
            });
        }
    };

    protected getRouteMiddlewares = (route: NormalizedRouteDefinition): MiddlewareHandler<T>[] => {
        const authEnabled = Boolean(this.auth?.enabled);
        const authAll = Boolean(this.auth?.authAll);
        const requiresAuth = authAll ? route.authorized !== false : route.authorized === true;

        if (requiresAuth && !authEnabled) {
            throw new Error(`Route ${route.method.toUpperCase()} ${route.path} requires auth but auth is disabled.`);
        }

        if (requiresAuth && !this.auth?.middleware) {
            throw new Error(
                `Auth is enabled but no auth middleware is configured for ${route.method.toUpperCase()} ${route.path}.`
            );
        }

        if (requiresAuth && this.auth?.middleware) {
            return [this.auth.middleware];
        }

        return [];
    };

    protected handleRoute = async (params: {
        route: NormalizedRouteDefinition;
        input: RouteInputs<RouteInputSchemas>;
        context: Context<T>;
    }): Promise<Response> => {
        const response = await params.route.handler(params.context as unknown as Context<AppEnv>, params.input);

        if (!(response instanceof Response)) {
            return response as Response;
        }

        if (!isJsonResponse(response) || shouldOmitBody(response.status)) {
            return response;
        }

        const jsonData = await assertJsonResponse(response);
        const data = params.route.schemas.response
            ? validateResponseData({ schema: params.route.schemas.response, data: jsonData })
            : jsonData;

        const payload = successEnvelope({
            requestId: getRequestId(params.context),
            data,
        });

        const headers = Object.fromEntries(response.headers.entries());
        return params.context.json(payload, {
            status: response.status as ContentfulStatusCode,
            headers,
        });
    };
}
