import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { getRequestId } from '../server/getRequestId';
import { getIsDevelopment } from '../server/isDevelopment';
import type { AppEnv } from '../server/types';
import { errorEnvelope } from './responseEnvelopes';

/**
 * @internal
 * Normalize unknown errors into `HTTPException` instances.
 *
 * @param error - Error value to normalize.
 * @returns An HTTPException instance for downstream handling.
 * @remarks
 * Non-HTTP exceptions are converted to a 500 error.
 */
const toHttpException = (error: unknown): HTTPException => {
    if (error instanceof HTTPException) return error;

    if (error instanceof Error) {
        return new HTTPException(500, { message: error.message, cause: error });
    }

    return new HTTPException(500, { message: 'Unknown error', cause: error });
};

/**
 * @internal
 * Extract validation errors from an HTTP exception cause.
 *
 * @param error - The exception to read from.
 * @returns Validation error details if present.
 * @remarks
 * This expects a `validationErrors` array on the error cause.
 */
const getValidationErrors = (error: HTTPException): Array<{ path: string; message: string }> | undefined => {
    const cause = error.cause as { validationErrors?: Array<{ path: string; message: string }> } | undefined;
    return cause?.validationErrors;
};

/**
 * Create a standardized Hono error handler.
 *
 * @returns An error handler that returns JSON error envelopes.
 * @remarks
 * Includes request IDs and stacks only when in development mode.
 * @example
 * ```ts
 * app.onError(createErrorHandler());
 * ```
 */
export const createErrorHandler =
    <T extends AppEnv = AppEnv>(): ErrorHandler<T> =>
    (error, c) => {
        const originalStack = error instanceof Error ? error.stack : undefined;
        const exception = toHttpException(error);
        const requestId = getRequestId(c);
        const isDevelopment = getIsDevelopment(c);

        const payload = errorEnvelope({
            requestId,
            statusCode: exception.status,
            errorMessage: exception.message,
            validationErrors: getValidationErrors(exception),
            errorStack: isDevelopment ? (originalStack ?? exception.stack) : undefined,
        });

        return c.json(payload, exception.status);
    };
