import type { ErrorHandler, Hono, MiddlewareHandler, NotFoundHandler } from 'hono';
import type { Logger } from 'pino';

import type { CorsOptions } from '../middleware/cors';
import type { DefaultMiddlewareOptions } from '../middleware/defaults';
import type { SecureHeadersOptions } from '../middleware/secureHeaders';
import type { AnyRouteDefinition, HttpMethod } from '../routing/route';

type BunServe = typeof import('bun')['serve'];
type BunServeConfig = Parameters<BunServe>[0];

export type BunServer = ReturnType<BunServe>;
export type MaybePromise<T> = T | Promise<T>;

export type AppEnv = {
    Variables: {
        requestId: string;
        requestStartTime?: number;
        isDevelopment?: boolean;
    };
};

export type LifecycleContext<T extends AppEnv = AppEnv> = {
    app: Hono<T>;
    server: BunServer;
    logger?: Logger;
};

export type HttpServerLifecycleHooks<T extends AppEnv = AppEnv> = {
    beforeStart?: () => MaybePromise<void>;
    afterStart?: (context: LifecycleContext<T>) => MaybePromise<void>;
    beforeStop?: (context: LifecycleContext<T> & { reason?: string }) => MaybePromise<void>;
    afterStop?: (context: { reason?: string; app: Hono<T>; logger?: Logger }) => MaybePromise<void>;
};

export type HttpServerStartOptions<T extends AppEnv = AppEnv> = {
    hostname: NonNullable<BunServeConfig['hostname']>;
    port: NonNullable<BunServeConfig['port']>;
    lifecycleHooks?: HttpServerLifecycleHooks<T>;
    serverFactory?: BunServe;
};

export type HttpServerStartResult = {
    server: BunServer;
    stop: (reason?: string) => Promise<void>;
};

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

export type RoutesObject = Record<string, Partial<Record<HttpMethod, AnyRouteDefinition>>>;
export type RoutesArray = AnyRouteDefinition[];
export type RoutesInput = RoutesObject | RoutesArray;

export type AuthConfig<T extends AppEnv = AppEnv> = {
    enabled: boolean;
    authAll?: boolean;
    middleware?: MiddlewareHandler<T>;
};

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
