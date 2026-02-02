import type { MiddlewareHandler } from 'hono';
import type { Logger } from 'pino';

import type { CorsOptions } from './cors';
import { createCors } from './cors';
import { createRequestLogger } from './requestLogger';
import { createRequestTracking } from './requestTracking';
import type { SecureHeadersOptions } from './secureHeaders';
import { createSecureHeaders } from './secureHeaders';
import { createTrimTrailingSlash } from './trimTrailingSlash';

export type DefaultMiddlewareOptions = {
    trimTrailingSlash?: boolean;
    requestTracking?: boolean;
    requestLogger?: boolean;
    cors?: boolean | CorsOptions;
    secureHeaders?: boolean | SecureHeadersOptions;
};

export type DefaultMiddlewareContext = {
    logger?: Logger;
};

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
