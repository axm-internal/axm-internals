import type { Context } from 'hono';

import type { AppEnv } from './types';

/**
 * Read the request ID from the Hono context.
 *
 * @param c - Hono context.
 * @returns The request ID or `unknown` when missing.
 * @remarks
 * This assumes request tracking middleware has set `requestId`.
 * @example
 * ```ts
 * const requestId = getRequestId(c);
 * ```
 */
export const getRequestId = <T extends AppEnv>(c: Context<T>): string => {
    const requestId = c.get('requestId');
    if (typeof requestId === 'string' && requestId.length > 0) return requestId;
    return 'unknown';
};
