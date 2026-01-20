import { describe, expect, it, mock } from 'bun:test';
import { Hono } from 'hono';
import type { AppEnv, TokenVerifier } from '../src';
import { createBearerTokenChecker, createCompositeTokenAuth, createQueryTokenChecker } from '../src';

const createService = (validator?: (token: string) => boolean) => {
    const verify = mock(async (token: string) => (validator ? validator(token) : true));
    return {
        service: {
            verify,
        } as TokenVerifier<AppEnv>,
        verify,
    };
};

const createApp = (service: TokenVerifier<AppEnv>) => {
    const middleware = createCompositeTokenAuth({
        middlewares: [createQueryTokenChecker({ service }), createBearerTokenChecker({ service })],
    });
    const app = new Hono<AppEnv>();
    app.use('*', middleware);
    app.get('/', (c) => c.json({ ok: true }));
    return app;
};

describe('createQueryTokenChecker', () => {
    it('authorizes when the query param provides a valid token', async () => {
        const { service, verify } = createService((token) => token === 'dev-token');
        const app = createApp(service);

        const response = await app.request('/?api-key=dev-token');

        expect(response.status).toBe(200);
        expect(verify).toHaveBeenCalledTimes(1);
        expect(verify).toHaveBeenCalledWith('dev-token', expect.anything());
    });

    it('throws when the query token is invalid', async () => {
        const { service } = createService(() => false);
        const app = createApp(service);

        const response = await app.request('/?api-key=bad-token');

        expect(response.status).toBe(401);
    });

    it('falls back to later middlewares when the param is missing', async () => {
        const { service, verify } = createService((token) => token === 'header-token');
        const app = createApp(service);

        const response = await app.request('/', {
            headers: {
                authorization: 'Bearer header-token',
            },
        });

        expect(response.status).toBe(200);
        expect(verify).toHaveBeenCalledTimes(1);
        expect(verify).toHaveBeenCalledWith('header-token', expect.anything());
    });
});
