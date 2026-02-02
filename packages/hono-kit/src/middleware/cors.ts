import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';

export type CorsOptions = Parameters<typeof cors>[0];

export const createCors = (options?: CorsOptions): MiddlewareHandler => cors(options);
