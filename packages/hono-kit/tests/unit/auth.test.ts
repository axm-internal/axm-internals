import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';

import type { AppEnv } from '../../src/index';
import { createBearerTokenChecker, createCompositeTokenAuth, createQueryTokenChecker } from '../../src/index';

describe('auth helpers', () => {
    it('authorizes via bearer token', async () => {
        const service = {
            verifyToken: async (token: string) => token === 'valid',
        };

        const app = new Hono<AppEnv>();
        app.use('/secure/*', createBearerTokenChecker({ service }));
        app.get('/secure/ping', (c) => c.text('ok'));

        const okResponse = await app.request('http://localhost/secure/ping', {
            headers: {
                Authorization: 'Bearer valid',
            },
        });

        expect(okResponse.status).toBe(200);
        expect(await okResponse.text()).toBe('ok');

        const forbiddenResponse = await app.request('http://localhost/secure/ping');
        expect(forbiddenResponse.status).toBe(401);
    });

    it('authorizes via query token', async () => {
        const service = {
            verifyToken: (token: string) => token === 'query-ok',
        };

        const app = new Hono<AppEnv>();
        app.use('/query/*', createQueryTokenChecker({ service }));
        app.get('/query/ping', (c) => c.text('ok'));

        const okResponse = await app.request('http://localhost/query/ping?api-key=query-ok');
        expect(okResponse.status).toBe(200);

        const forbiddenResponse = await app.request('http://localhost/query/ping');
        expect(forbiddenResponse.status).toBe(401);
    });

    it('falls back to later auth strategies in composite auth', async () => {
        const service = {
            verifyToken: async (token: string) => token === 'valid',
        };

        const app = new Hono<AppEnv>();
        app.use(
            '/composite/*',
            createCompositeTokenAuth({
                middlewares: [createQueryTokenChecker({ service }), createBearerTokenChecker({ service })],
            })
        );
        app.get('/composite/ping', (c) => c.text('ok'));

        const response = await app.request('http://localhost/composite/ping', {
            headers: {
                Authorization: 'Bearer valid',
            },
        });

        expect(response.status).toBe(200);
        expect(await response.text()).toBe('ok');
    });

    it('uses onUnauthorized when all strategies fail', async () => {
        const service = {
            verifyToken: (token: string) => token === 'valid',
        };

        const app = new Hono<AppEnv>();
        app.use(
            '/failure/*',
            createCompositeTokenAuth({
                middlewares: [createQueryTokenChecker({ service })],
                onUnauthorized: (c) => c.json({ error: 'unauthorized' }, 401),
            })
        );
        app.get('/failure/ping', (c) => c.text('ok'));

        const response = await app.request('http://localhost/failure/ping');
        const body = (await response.json()) as { error: string };

        expect(response.status).toBe(401);
        expect(body.error).toBe('unauthorized');
    });
});
