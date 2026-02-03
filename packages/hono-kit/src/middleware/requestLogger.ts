import type { MiddlewareHandler } from 'hono';
import type { Logger } from 'pino';

import { getRequestId } from '../server/getRequestId';
import type { AppEnv } from '../server/types';

/**
 * Options for request logging middleware.
 *
 * @remarks
 * The message is used as the log line message in Pino.
 * @example
 * ```ts
 * const options: RequestLoggerOptions = { logger, message: 'http' };
 * ```
 */
export type RequestLoggerOptions = {
    logger: Logger;
    message?: string;
};

/**
 * Create middleware that logs requests after completion.
 *
 * @param options - Logger and message configuration.
 * @returns A middleware handler that logs request metrics.
 * @remarks
 * Reads request timing data set by request tracking middleware when available.
 * @example
 * ```ts
 * const requestLogger = createRequestLogger({ logger });
 * ```
 */
export const createRequestLogger =
    (options: RequestLoggerOptions): MiddlewareHandler<AppEnv> =>
    async (c, next) => {
        const { logger, message = 'request' } = options;
        const storedStartTime = c.get('requestStartTime');
        const startTime = typeof storedStartTime === 'number' ? storedStartTime : Date.now();

        try {
            await next();
        } finally {
            const durationMs = Date.now() - startTime;
            const requestId = getRequestId(c);

            logger.info(
                {
                    requestId,
                    method: c.req.method,
                    path: c.req.path,
                    status: c.res?.status ?? 200,
                    durationMs,
                },
                message
            );
        }
    };
