import type { MiddlewareHandler } from 'hono';
import type { Logger } from 'pino';

import type { CorsOptions } from './cors';
import { createCors } from './cors';
import { createRequestLogger } from './requestLogger';
import { createRequestTracking } from './requestTracking';
import type { SecureHeadersOptions } from './secureHeaders';
import { createSecureHeaders } from './secureHeaders';
import { createTrimTrailingSlash } from './trimTrailingSlash';

/**
 * Flags and options for the default middleware set.
 *
 * @remarks
 * Each flag can be disabled or configured with specific options.
 * @example
 * ```ts
 * const options: DefaultMiddlewareOptions = {
 *   cors: { origin: '*' },
 *   secureHeaders: true,
 * };
 * ```
 */
export type DefaultMiddlewareOptions = {
    trimTrailingSlash?: boolean;
    requestTracking?: boolean;
    requestLogger?: boolean;
    cors?: boolean | CorsOptions;
    secureHeaders?: boolean | SecureHeadersOptions;
};

/**
 * Context required by default middlewares.
 *
 * @remarks
 * Provide a logger to enable request logging.
 * @example
 * ```ts
 * const context: DefaultMiddlewareContext = { logger };
 * ```
 */
export type DefaultMiddlewareContext = {
    logger?: Logger;
};

/**
 * Build the default middleware chain for a server.
 *
 * @param options - Feature flags and middleware-specific options.
 * @param context - External dependencies such as logging.
 * @returns A list of middleware handlers.
 * @remarks
 * Middleware are returned in a stable order to ensure consistent behavior.
 * @example
 * ```ts
 * const middlewares = createDefaultMiddlewares({ requestLogger: true }, { logger });
 * ```
 */
export const createDefaultMiddlewares = (
    options: DefaultMiddlewareOptions = {},
    context: DefaultMiddlewareContext = {}
): MiddlewareHandler[] => {
    const middlewares: MiddlewareHandler[] = [];
    const {
        trimTrailingSlash = true,
        requestTracking = true,
        requestLogger = true,
        cors: corsOptions,
        secureHeaders: secureHeadersOptions,
    } = options;

    if (trimTrailingSlash) {
        middlewares.push(createTrimTrailingSlash());
    }

    if (requestTracking) {
        middlewares.push(createRequestTracking());
    }

    if (requestLogger && context.logger) {
        middlewares.push(createRequestLogger({ logger: context.logger }));
    }

    if (corsOptions) {
        middlewares.push(createCors(corsOptions === true ? undefined : corsOptions));
    }

    if (secureHeadersOptions) {
        middlewares.push(createSecureHeaders(secureHeadersOptions === true ? undefined : secureHeadersOptions));
    }

    return middlewares;
};
