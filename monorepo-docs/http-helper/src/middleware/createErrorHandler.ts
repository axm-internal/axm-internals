import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { Logger } from 'pino';

export const createErrorHandler = (logger: Logger): ErrorHandler => {
    return (err, c) => {
        const requestId = c.get('requestId');
        let status: ContentfulStatusCode = 500;
        if (err instanceof HTTPException) {
            status = err.status;
            logger.warn(
                {
                    requestId,
                    status: err.status,
                    message: err.message,
                    path: c.req.path,
                    method: c.req.method,
                },
                'HTTP exception occurred'
            );
        } else {
            logger.error(
                {
                    requestId,
                    error: err,
                    path: c.req.path,
                    method: c.req.method,
                    stack: err.stack,
                },
                'Unhandled error occurred'
            );
        }

        return c.json(
            {
                requestId,
                status,
                path: c.req.path,
                method: c.req.method,
                error: err?.message,
            },
            status
        );
    };
};
