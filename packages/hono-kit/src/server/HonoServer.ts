import type { Context, MiddlewareHandler } from 'hono';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Logger } from 'pino';

import { createErrorHandler } from '../errors/errorHandler';
import { errorEnvelope, successEnvelope } from '../errors/responseEnvelopes';
import { buildRouteInputs } from '../routing/registerRoutes';
import type { RouteInputSchemas, RouteInputs } from '../routing/route';
import { joinPaths } from '../utils/joinPaths';
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

/**
 * @internal
 * Constructor parameters for `HonoServer`.
 *
 * @remarks
 * Use `CreateHonoServerOptions` and `createHonoServer` for the public API.
 */
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

/**
 * @internal
 * Determine whether a response is JSON.
 *
 * @param response - Response to inspect.
 * @returns `true` when the response has a JSON content type.
 * @remarks
 * Checks for `application/json` or `+json` media types.
 */
const isJsonResponse = (response: Response): boolean => {
    const contentType = response.headers.get('content-type') ?? '';
    return contentType.includes('application/json') || contentType.includes('+json');
};

/**
 * @internal
 * Parse a JSON response or throw a 500 error.
 *
 * @param response - Response to parse.
 * @returns Parsed JSON value.
 * @remarks
 * Throws when the response body cannot be parsed as JSON.
 */
const assertJsonResponse = async (response: Response): Promise<unknown> => {
    try {
        return await response.clone().json();
    } catch {
        throw new HTTPException(500, { message: 'Invalid JSON response' });
    }
};

/**
 * @internal
 * Determine whether a response status should omit the body.
 *
 * @param status - HTTP status code.
 * @returns `true` when the response must not include a body.
 * @remarks
 * Covers 204 and 304 responses.
 */
const shouldOmitBody = (status: number): boolean => status === 204 || status === 304;

/**
 * Hono-based HTTP server wrapper with routing and response validation.
 *
 * @remarks
 * Handles route registration, response envelopes, and lifecycle hooks.
 * @example
 * ```ts
 * const server = new HonoServer({ name: 'api', routes });
 * await server.start({ hostname: '0.0.0.0', port: 3000 });
 * ```
 */
export class HonoServer<T extends AppEnv = AppEnv> {
    /**
     * Server name used for logging and identification.
     *
     * @remarks
     * This is the `name` passed to the constructor.
     * @example
     * ```ts
     * console.log(server.name);
     * ```
     */
    readonly name: string;
    /**
     * Underlying Hono application instance.
     *
     * @remarks
     * Use this to add middleware or routes directly when needed.
     * @example
     * ```ts
     * server.app.get('/health', (c) => c.text('ok'));
     * ```
     */
    readonly app: Hono<T>;
    /**
     * Normalized route collection for this server.
     *
     * @remarks
     * Use `routes.items` to inspect registered routes.
     * @example
     * ```ts
     * const routes = server.routes.items;
     * ```
     */
    readonly routes: RoutesCollection;
    /**
     * Optional logger instance used by the server.
     *
     * @remarks
     * Provided via constructor params.
     * @example
     * ```ts
     * if (server.logger) server.logger.info('server ready');
     * ```
     */
    readonly logger?: Logger;

    /**
     * @internal
     * Optional route prefix applied during registration.
     *
     * @remarks
     * Stored from constructor params.
     */
    protected routePrefix?: string;
    /**
     * @internal
     * Optional lifecycle hooks used during server start/stop.
     *
     * @remarks
     * Stored from constructor params.
     */
    protected lifecycleHooks?: HttpServerLifecycleHooks<T>;
    /**
     * @internal
     * Authentication configuration for route protection.
     *
     * @remarks
     * Determines whether routes require auth and which middleware to use.
     */
    protected auth?: AuthConfig<T>;

    /**
     * Create a new `HonoServer`.
     *
     * @param params - Server configuration and dependencies.
     * @remarks
     * Registers routes and handlers immediately when provided.
     * @example
     * ```ts
     * const server = new HonoServer({ name: 'api', routes });
     * ```
     */
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

    /**
     * Add routes to the server and register them with the app.
     *
     * @param routes - Routes to register.
     * @returns Nothing.
     * @remarks
     * New routes are appended and registered immediately.
     * @example
     * ```ts
     * server.mount(routes);
     * ```
     */
    mount = (routes: RoutesInput): void => {
        const startIndex = this.routes.items.length;
        this.routes.add(routes);
        const newRoutes = this.routes.items.slice(startIndex);
        this.registerRoutes(newRoutes);
    };

    /**
     * Start the underlying HTTP server.
     *
     * @param options - Host/port and optional lifecycle hooks.
     * @returns The server instance and a stop helper.
     * @remarks
     * Uses `Bun.serve` by default unless a custom factory is provided.
     * @example
     * ```ts
     * const { stop } = await server.start({ hostname: '0.0.0.0', port: 3000 });
     * ```
     */
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

    /**
     * @internal
     * Register normalized routes on the underlying Hono app.
     *
     * @param routes - Normalized routes to register.
     * @returns Nothing.
     * @remarks
     * Applies route-level middleware and input validation before handler execution.
     */
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

    /**
     * @internal
     * Resolve middleware for a route, including auth enforcement.
     *
     * @param route - Route definition to evaluate.
     * @returns A list of middleware handlers.
     * @remarks
     * Throws when auth is required but misconfigured.
     */
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

    /**
     * @internal
     * Execute a route handler with validation and response wrapping.
     *
     * @param params - Route, inputs, and context for the handler.
     * @returns A response object.
     * @remarks
     * Successful JSON responses are wrapped in a success envelope.
     */
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
