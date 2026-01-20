import { describe, expect, it, mock } from 'bun:test';
import type { MiddlewareHandler } from 'hono';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv, TokenVerifier } from '../src';
import { createBearerTokenChecker, createCompositeTokenAuth } from '../src';

const createService = (validator?: (token: string) => boolean) => {
    const verify = mock(async (token: string) => (validator ? validator(token) : true));
    return {
        service: {
            verify,
        } as TokenVerifier<AppEnv>,
        verify,
    };
};

const createQueryMiddleware = (
    service: TokenVerifier<AppEnv>,
    param: string = 'api-key'
): MiddlewareHandler<AppEnv> => {
    return async (c, next) => {
        const value = c.req.query(param);
        if (!value) {
            return;
        }
        const ok = await service.verify(value, c);
        if (!ok) {
            throw new HTTPException(401);
        }
        await next();
    };
};

const createApp = (middlewares: MiddlewareHandler<AppEnv>[]) => {
    const middleware = createCompositeTokenAuth({
        middlewares,
    });
    const app = new Hono<AppEnv>();
    app.use('*', middleware);
    app.get('/', (c) => c.json({ ok: true }));
    return app;
};

describe('createCompositeTokenAuth', () => {
    it('allows requests when any middleware authorizes the request', async () => {
        const { service, verify } = createService((token) => token === 'dev-token');
        const app = createApp([createQueryMiddleware(service), createBearerTokenChecker({ service })]);

        const response = await app.request('/?api-key=dev-token');

        expect(response.status).toBe(200);
        expect(verify).toHaveBeenCalledTimes(1);
        expect(verify).toHaveBeenCalledWith('dev-token', expect.anything());
    });

    it('falls back to later middlewares when earlier ones skip the request', async () => {
        const { service, verify } = createService((token) => token === 'secret');
        const app = createApp([createQueryMiddleware(service), createBearerTokenChecker({ service })]);

        const response = await app.request('/', {
            headers: {
                authorization: 'Bearer secret',
            },
        });

        expect(response.status).toBe(200);
        expect(verify).toHaveBeenCalledTimes(1);
        expect(verify).toHaveBeenCalledWith('secret', expect.anything());
    });

    it('returns 401 when every middleware rejects the request', async () => {
        const { service, verify } = createService(() => false);
        const app = createApp([createQueryMiddleware(service), createBearerTokenChecker({ service })]);

        const response = await app.request('/');

        expect(response.status).toBe(401);
        expect(verify).not.toHaveBeenCalled();
    });
});
