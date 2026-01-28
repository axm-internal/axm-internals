import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getRequestId } from '../server/getRequestId';
import { getIsDevelopment } from '../server/isDevelopment';
import type { AppEnv } from '../server/types';
import { errorEnvelope } from './responseEnvelopes';

const toHttpException = (error: unknown): HTTPException => {
    if (error instanceof HTTPException) return error;

    if (error instanceof Error) {
        return new HTTPException(500, { message: error.message, cause: error });
    }

    return new HTTPException(500, { message: 'Unknown error', cause: error });
};

const getValidationErrors = (error: HTTPException): Array<{ path: string; message: string }> | undefined => {
    const cause = error.cause as { validationErrors?: Array<{ path: string; message: string }> } | undefined;
    return cause?.validationErrors;
};

export const createErrorHandler =
    <T extends AppEnv = AppEnv>(): ErrorHandler<T> =>
    (error, c) => {
        const exception = toHttpException(error);
        const requestId = getRequestId(c);
        const isDevelopment = getIsDevelopment(c);

        const payload = errorEnvelope({
            requestId,
            statusCode: exception.status,
            errorMessage: exception.message,
            validationErrors: getValidationErrors(exception),
            errorStack: isDevelopment ? exception.stack : undefined,
        });

        return c.json(payload, exception.status);
    };
