import type { ErrorHandler, Hono, MiddlewareHandler, NotFoundHandler } from 'hono';
import type { Logger } from 'pino';

import type { CorsOptions } from '../middleware/cors';
import type { DefaultMiddlewareOptions } from '../middleware/defaults';
import type { SecureHeadersOptions } from '../middleware/secureHeaders';
import type { AnyRouteDefinition, HttpMethod } from '../routing/route';

/**
 * @internal
 * Bun server factory type.
 *
 * @remarks
 * Used to infer options and return types for Bun server creation.
 */
type BunServe = typeof import('bun')['serve'];
/**
 * @internal
 * Bun server configuration type.
 *
 * @remarks
 * Derived from the Bun `serve` function parameters.
 */
type BunServeConfig = Parameters<BunServe>[0];

/**
 * Bun server instance returned by `Bun.serve`.
 *
 * @remarks
 * Used for typing lifecycle hooks and server start results.
 * @example
 * ```ts
 * const server: BunServer = Bun.serve({ fetch: app.fetch, port: 3000 });
 * ```
 */
export type BunServer = ReturnType<BunServe>;
/**
 * A value that may be returned synchronously or as a Promise.
 *
 * @remarks
 * Useful for lifecycle hooks that can be async.
 * @example
 * ```ts
 * const maybe: MaybePromise<void> = Promise.resolve();
 * ```
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Environment variables used by the Hono server context.
 *
 * @remarks
 * Includes request metadata stored on the Hono context.
 * @example
 * ```ts
 * const env: AppEnv = { Variables: { requestId: 'req_123' } };
 * ```
 */
export type AppEnv = {
    Variables: {
        requestId: string;
        requestStartTime?: number;
        isDevelopment?: boolean;
    };
};

/**
 * Context passed to lifecycle hooks.
 *
 * @remarks
 * Provides access to the app, server, and optional logger.
 * @example
 * ```ts
 * const hooks: HttpServerLifecycleHooks = {
 *   afterStart: ({ server }) => console.log(server),
 * };
 * ```
 */
export type LifecycleContext<T extends AppEnv = AppEnv> = {
    app: Hono<T>;
    server: BunServer;
    logger?: Logger;
};

/**
 * Lifecycle hooks for server start/stop events.
 *
 * @remarks
 * Hooks may be sync or async and are invoked around server lifecycle transitions.
 * @example
 * ```ts
 * const hooks: HttpServerLifecycleHooks = {
 *   beforeStart: () => console.log('starting'),
 * };
 * ```
 */
export type HttpServerLifecycleHooks<T extends AppEnv = AppEnv> = {
    beforeStart?: () => MaybePromise<void>;
    afterStart?: (context: LifecycleContext<T>) => MaybePromise<void>;
    beforeStop?: (context: LifecycleContext<T> & { reason?: string }) => MaybePromise<void>;
    afterStop?: (context: { reason?: string; app: Hono<T>; logger?: Logger }) => MaybePromise<void>;
};

/**
 * Options used when starting the server.
 *
 * @remarks
 * Specify hostname/port and optional lifecycle hooks and server factory.
 * @example
 * ```ts
 * const options: HttpServerStartOptions = { hostname: '0.0.0.0', port: 3000 };
 * ```
 */
export type HttpServerStartOptions<T extends AppEnv = AppEnv> = {
    hostname: NonNullable<BunServeConfig['hostname']>;
    port: NonNullable<BunServeConfig['port']>;
    lifecycleHooks?: HttpServerLifecycleHooks<T>;
    serverFactory?: BunServe;
};

/**
 * Result returned after starting the server.
 *
 * @remarks
 * Includes the server instance and a `stop` helper.
 * @example
 * ```ts
 * const { server, stop } = await honoServer.start({ hostname: '0.0.0.0', port: 3000 });
 * ```
 */
export type HttpServerStartResult = {
    server: BunServer;
    stop: (reason?: string) => Promise<void>;
};

/**
 * Parameters for constructing a raw Hono server wrapper.
 *
 * @remarks
 * Used internally for server composition and dependency injection.
 * @example
 * ```ts
 * const params: HttpServerParams = { name: 'api', routes: new Hono() };
 * ```
 */
export type HttpServerParams<T extends AppEnv = AppEnv> = {
    name: string;
    routes: Hono<T>;
    routePrefix?: string;
    honoApp?: Hono<T>;
    logger?: Logger;
    errorHandler?: ErrorHandler;
    notFoundHandler?: NotFoundHandler<T>;
    middlewareCollection?: MiddlewareHandler[];
    lifecycleHooks?: HttpServerLifecycleHooks<T>;
};

/**
 * Route definitions keyed by path and method.
 *
 * @remarks
 * Each path maps to a partial map of HTTP methods to route definitions.
 * @example
 * ```ts
 * const routes: RoutesObject = { '/health': { get: route({ method: 'get', path: '/health', schemas: {}, handler }) } };
 * ```
 */
export type RoutesObject = Record<string, Partial<Record<HttpMethod, AnyRouteDefinition>>>;
/**
 * Array form for route definitions.
 *
 * @remarks
 * Each entry must include method and path fields.
 * @example
 * ```ts
 * const routes: RoutesArray = [route({ method: 'get', path: '/health', schemas: {}, handler })];
 * ```
 */
export type RoutesArray = AnyRouteDefinition[];
/**
 * Any accepted route input structure.
 *
 * @remarks
 * Supports both object and array route definitions.
 * @example
 * ```ts
 * const routes: RoutesInput = { '/health': { get: route({ method: 'get', path: '/health', schemas: {}, handler }) } };
 * ```
 */
export type RoutesInput = RoutesObject | RoutesArray;

/**
 * Authentication configuration for the server.
 *
 * @remarks
 * Enable auth and provide middleware to enforce it.
 * @example
 * ```ts
 * const auth: AuthConfig = { enabled: true, middleware: authMiddleware };
 * ```
 */
export type AuthConfig<T extends AppEnv = AppEnv> = {
    enabled: boolean;
    authAll?: boolean;
    middleware?: MiddlewareHandler<T>;
};

/**
 * Options for creating a `HonoServer`.
 *
 * @remarks
 * Includes route registration, defaults, and middleware configuration.
 * @example
 * ```ts
 * const options: CreateHonoServerOptions = { name: 'api', routes };
 * ```
 */
export type CreateHonoServerOptions<T extends AppEnv = AppEnv> = {
    name: string;
    isDevelopment?: boolean;
    routes?: RoutesInput;
    routePrefix?: string;
    logger?: Logger;
    middlewares?: MiddlewareHandler<T>[];
    defaults?: DefaultMiddlewareOptions;
    cors?: CorsOptions;
    secureHeaders?: SecureHeadersOptions;
    auth?: AuthConfig<T>;
    errorHandler?: ErrorHandler;
    notFoundHandler?: NotFoundHandler<T>;
    lifecycleHooks?: HttpServerLifecycleHooks<T>;
    honoApp?: Hono<T>;
};
