import type { Context } from 'hono';

import type { AppEnv } from './types';

/**
 * Read the `isDevelopment` flag from the request context.
 *
 * @param c - Hono context.
 * @returns `true` when the request is marked as development mode.
 * @remarks
 * This value is set by `HonoServer` when configured.
 * @example
 * ```ts
 * if (getIsDevelopment(c)) {
 *   console.log('development mode');
 * }
 * ```
 */
export const getIsDevelopment = <T extends AppEnv>(c: Context<T>): boolean => {
    const isDevelopment = c.get('isDevelopment');
    return Boolean(isDevelopment);
};
