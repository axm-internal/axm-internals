import type { MiddlewareHandler } from 'hono';
import { trimTrailingSlash } from 'hono/trailing-slash';

/**
 * Create middleware that normalizes trailing slashes.
 *
 * @returns A middleware handler that trims trailing slashes from URLs.
 * @remarks
 * Delegates to `hono/trailing-slash` for implementation.
 * @example
 * ```ts
 * app.use('*', createTrimTrailingSlash());
 * ```
 */
export const createTrimTrailingSlash = (): MiddlewareHandler => trimTrailingSlash();
