import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';

/**
 * Options passed through to `hono/cors`.
 *
 * @remarks
 * Use this to configure allowed origins, headers, and methods.
 * @example
 * ```ts
 * const options: CorsOptions = { origin: ['https://example.com'] };
 * ```
 */
export type CorsOptions = Parameters<typeof cors>[0];

/**
 * Create a CORS middleware instance.
 *
 * @param options - CORS configuration options.
 * @returns A Hono middleware that applies CORS headers.
 * @remarks
 * Delegates to `hono/cors` for implementation.
 * @example
 * ```ts
 * const corsMiddleware = createCors({ origin: '*' });
 * ```
 */
export const createCors = (options?: CorsOptions): MiddlewareHandler => cors(options);
