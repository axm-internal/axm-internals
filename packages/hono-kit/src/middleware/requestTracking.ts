import type { MiddlewareHandler } from 'hono';

import type { AppEnv } from '../server/types';

/**
 * @internal
 * Header name used to read request IDs.
 *
 * @remarks
 * Clients can pass this header to supply a request ID.
 */
const REQUEST_ID_HEADER = 'x-request-id';

/**
 * @internal
 * Generate a request ID when none is provided.
 *
 * @returns A new request ID string.
 * @remarks
 * Prefers `crypto.randomUUID` when available.
 */
const generateRequestId = (): string => {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

/**
 * @internal
 * Read the request ID header from a Hono context.
 *
 * @param c - Context-like object with a header accessor.
 * @returns A non-empty request ID or `undefined`.
 * @remarks
 * Empty header values are treated as missing.
 */
const getHeaderRequestId = (c: { req: { header: (name: string) => string | undefined } }): string | undefined => {
    const headerValue = c.req.header(REQUEST_ID_HEADER);
    if (typeof headerValue === 'string' && headerValue.length > 0) {
        return headerValue;
    }

    return undefined;
};

/**
 * @internal
 * Normalize a potentially invalid request ID value.
 *
 * @param requestId - Value to normalize.
 * @returns The request ID when valid, otherwise `undefined`.
 * @remarks
 * Only non-empty strings are accepted.
 */
const normalizeRequestId = (requestId: unknown): string | undefined => {
    if (typeof requestId === 'string' && requestId.length > 0) {
        return requestId;
    }

    return undefined;
};

/**
 * Create middleware that ensures a request ID and start time are set.
 *
 * @returns A middleware handler that tracks request IDs and timing.
 * @remarks
 * This sets `requestId` and `requestStartTime` on the Hono context.
 * @example
 * ```ts
 * app.use('*', createRequestTracking());
 * ```
 */
export const createRequestTracking = (): MiddlewareHandler<AppEnv> => async (c, next) => {
    const existingRequestId = normalizeRequestId(c.get('requestId'));
    const headerRequestId = getHeaderRequestId(c);
    const requestId = existingRequestId ?? headerRequestId ?? generateRequestId();

    if (!existingRequestId) {
        c.set('requestId', requestId);
    }

    c.set('requestStartTime', Date.now());

    await next();
};
