import type { MiddlewareHandler } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

/**
 * Options passed through to `hono/secure-headers`.
 *
 * @remarks
 * Use this to configure security-related HTTP headers.
 * @example
 * ```ts
 * const options: SecureHeadersOptions = { xFrameOptions: 'DENY' };
 * ```
 */
export type SecureHeadersOptions = Parameters<typeof secureHeaders>[0];

/**
 * Create a secure-headers middleware instance.
 *
 * @param options - Secure header configuration options.
 * @returns A Hono middleware that applies secure headers.
 * @remarks
 * Delegates to `hono/secure-headers` for implementation.
 * @example
 * ```ts
 * const secureHeaders = createSecureHeaders();
 * ```
 */
export const createSecureHeaders = (options?: SecureHeadersOptions): MiddlewareHandler => secureHeaders(options);
