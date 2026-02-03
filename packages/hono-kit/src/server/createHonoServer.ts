import type { MiddlewareHandler } from 'hono';

import { createDefaultMiddlewares } from '../middleware/defaults';
import { HonoServer } from './HonoServer';
import type { AppEnv, CreateHonoServerOptions } from './types';

/**
 * Create a `HonoServer` with defaults and middleware wiring.
 *
 * @param options - Server configuration and middleware options.
 * @returns A configured `HonoServer` instance.
 * @remarks
 * Default middleware are computed from `options.defaults`, `cors`, and `secureHeaders`.
 * @example
 * ```ts
 * const server = createHonoServer({ name: 'api', routes });
 * ```
 */
export const createHonoServer = <TEnv extends AppEnv = AppEnv>(
    options: CreateHonoServerOptions<TEnv>
): HonoServer<TEnv> => {
    const defaults = {
        ...options.defaults,
        cors: options.cors ?? options.defaults?.cors,
        secureHeaders: options.secureHeaders ?? options.defaults?.secureHeaders,
    };

    const defaultMiddlewares = createDefaultMiddlewares(defaults, { logger: options.logger });
    const middlewares: MiddlewareHandler[] = [...defaultMiddlewares, ...(options.middlewares ?? [])];

    return new HonoServer({
        name: options.name,
        routes: options.routes,
        routePrefix: options.routePrefix,
        logger: options.logger,
        middlewareCollection: middlewares,
        errorHandler: options.errorHandler,
        notFoundHandler: options.notFoundHandler,
        lifecycleHooks: options.lifecycleHooks,
        auth: options.auth,
        isDevelopment: options.isDevelopment,
        honoApp: options.honoApp,
    });
};
