import { createMiddleware } from 'hono/factory';

export const createRequestTrackingMiddleware = () =>
    createMiddleware(async (c, next) => {
        c.set('requestStartTime', Date.now());
        await next();
    });
