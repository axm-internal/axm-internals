/**
 * A single validation error detail.
 *
 * @remarks
 * Used in error envelopes for validation failures.
 * @example
 * ```ts
 * const item: ValidationErrorItem = { path: 'body.email', message: 'Invalid email' };
 * ```
 */
export type ValidationErrorItem = {
    path: string;
    message: string;
};

/**
 * Standard success response envelope.
 *
 * @remarks
 * Wraps a request ID alongside the response data.
 * @example
 * ```ts
 * const payload: SuccessEnvelope<string> = {
 *   status: 'success',
 *   requestId: 'req_123',
 *   data: 'ok',
 * };
 * ```
 */
export type SuccessEnvelope<T> = {
    status: 'success';
    requestId: string;
    data: T | null;
};

/**
 * Standard error response envelope.
 *
 * @remarks
 * Includes HTTP status and optional validation details.
 * @example
 * ```ts
 * const payload: ErrorEnvelope = {
 *   status: 'error',
 *   requestId: 'req_123',
 *   statusCode: 400,
 *   errorMessage: 'Validation failed',
 * };
 * ```
 */
export type ErrorEnvelope = {
    status: 'error';
    requestId: string;
    statusCode: number;
    errorCode?: string;
    errorMessage: string;
    validationErrors?: ValidationErrorItem[];
    errorStack?: string;
};

/**
 * Build a success response envelope.
 *
 * @param params - Request metadata and response data.
 * @returns A success envelope payload.
 * @remarks
 * Use this to standardize successful responses.
 * @example
 * ```ts
 * const payload = successEnvelope({ requestId: 'req_123', data: { ok: true } });
 * ```
 */
export const successEnvelope = <T>(params: { requestId: string; data: T | null }): SuccessEnvelope<T> => ({
    status: 'success',
    requestId: params.requestId,
    data: params.data,
});

/**
 * Build an error response envelope.
 *
 * @param params - Error details and request metadata.
 * @returns An error envelope payload.
 * @remarks
 * Validation errors and stack traces are optional and should be included only when appropriate.
 * @example
 * ```ts
 * const payload = errorEnvelope({
 *   requestId: 'req_123',
 *   statusCode: 401,
 *   errorMessage: 'Unauthorized',
 * });
 * ```
 */
export const errorEnvelope = (params: {
    requestId: string;
    statusCode: number;
    errorMessage: string;
    errorCode?: string;
    validationErrors?: ValidationErrorItem[];
    errorStack?: string;
}): ErrorEnvelope => ({
    status: 'error',
    requestId: params.requestId,
    statusCode: params.statusCode,
    errorCode: params.errorCode,
    errorMessage: params.errorMessage,
    validationErrors: params.validationErrors,
    errorStack: params.errorStack,
});
