import type { ErrorHandler, Hono, MiddlewareHandler, NotFoundHandler } from 'hono';
import type { cors } from 'hono/cors';
import type { secureHeaders } from 'hono/secure-headers';
import type { Logger } from 'pino';

export type AppEnv = {
    Variables: {
        requestId: string;
        requestStartTime?: number;
    };
};

export type HttpAppParams<T extends AppEnv = AppEnv> = {
    name: string;
    routes: Hono<T>;
    routePrefix?: string;
    honoApp?: Hono<T>;
    logger?: Logger;
    errorHandler?: ErrorHandler;
    notFoundHandler?: NotFoundHandler<T>;
    middlewareCollection?: MiddlewareHandler[];
    lifecycleHooks?: HttpServerLifecycleHooks;
};
export type CORSOptions = Parameters<typeof cors>[0];
export type SecureHeadersOptions = Parameters<typeof secureHeaders>[0];

type BunServe = typeof import('bun')['serve'];
type BunServeConfig = Parameters<BunServe>[0];
export type BunServer = ReturnType<BunServe>;
export type MaybePromise<T> = T | Promise<T>;

export type HttpServerLifecycleHooks = {
    beforeStart?: () => MaybePromise<void>;
    afterStart?: (context: { server: BunServer }) => MaybePromise<void>;
    beforeStop?: (context: { server: BunServer; reason?: string }) => MaybePromise<void>;
    afterStop?: (context: { reason?: string }) => MaybePromise<void>;
};

export type HttpServerStartOptions<_T extends AppEnv = AppEnv> = {
    hostname: NonNullable<BunServeConfig['hostname']>;
    port: NonNullable<BunServeConfig['port']>;
    lifecycleHooks?: HttpServerLifecycleHooks;
    serverFactory?: BunServe;
};

export type HttpServerStartResult = {
    server: BunServer;
    stop: (reason?: string) => Promise<void>;
};
