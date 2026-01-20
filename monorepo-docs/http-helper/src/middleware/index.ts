import type { MiddlewareHandler } from 'hono';
import { secureHeaders } from 'hono/secure-headers';
import { trimTrailingSlash } from 'hono/trailing-slash';

export const middlewares: MiddlewareHandler[] = [
    trimTrailingSlash(),
    // requestTrackingMiddleware,
    // cors({
    //     origin: appConfig.http.corsOrigins,
    // }),
    secureHeaders({
        contentSecurityPolicy: {
            defaultSrc: ["'self'"],
        },
        crossOriginEmbedderPolicy: false,
    }),
    // loggerMiddleware,
];
