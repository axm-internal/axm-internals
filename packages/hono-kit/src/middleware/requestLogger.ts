import type { MiddlewareHandler } from 'hono';
import type { Logger } from 'pino';

import { getRequestId } from '../server/getRequestId';
import type { AppEnv } from '../server/types';

export type RequestLoggerOptions = {
    logger: Logger;
    message?: string;
};

export const createRequestLogger =
    (options: RequestLoggerOptions): MiddlewareHandler<AppEnv> =>
    async (c, next) => {
        const { logger, message = 'request' } = options;
        const storedStartTime = c.get('requestStartTime');
        const startTime = typeof storedStartTime === 'number' ? storedStartTime : Date.now();

        await next();

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
    };
