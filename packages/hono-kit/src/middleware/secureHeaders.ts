import type { MiddlewareHandler } from 'hono';
import { secureHeaders } from 'hono/secure-headers';

export type SecureHeadersOptions = Parameters<typeof secureHeaders>[0];

export const createSecureHeaders = (options?: SecureHeadersOptions): MiddlewareHandler => secureHeaders(options);
