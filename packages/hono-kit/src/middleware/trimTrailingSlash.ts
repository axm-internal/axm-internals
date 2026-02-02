import type { MiddlewareHandler } from 'hono';
import { trimTrailingSlash } from 'hono/trailing-slash';

export const createTrimTrailingSlash = (): MiddlewareHandler => trimTrailingSlash();
