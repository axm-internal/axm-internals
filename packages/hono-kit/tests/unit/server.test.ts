import { describe, expect, it } from 'bun:test';
import { z } from 'zod';

import { type AppEnv, createHonoServer, createQueryTokenChecker, route } from '../../src/index';

describe('createHonoServer', () => {
    it('wraps JSON responses with the success envelope', async () => {
        const server = createHonoServer({
            name: 'EnvelopeServer',
            routes: {
                '/hello': {
                    get: route({
                        handler: (c) => c.json({ greeting: 'hi' }),
                    }),
                },
            },
        });

        const response = await server.app.request('http://localhost/hello');
        const body = (await response.json()) as { status: string; data: { greeting: string } };

        expect(response.status).toBe(200);
        expect(body.status).toBe('success');
        expect(body.data.greeting).toBe('hi');
    });

    it('validates response payload when a schema is provided', async () => {
        const server = createHonoServer({
            name: 'ValidationServer',
            routes: {
                '/bad': {
                    get: route({
                        response: z.object({ ok: z.boolean() }),
                        handler: (c) => c.json({ ok: 'nope' }),
                    }),
                },
            },
        });

        const response = await server.app.request('http://localhost/bad');
        const body = (await response.json()) as {
            status: string;
            errorMessage: string;
            validationErrors?: Array<{ path: string; message: string }>;
        };

        expect(response.status).toBe(400);
        expect(body.status).toBe('error');
        expect(body.errorMessage).toBe('Response validation failed');
        expect(body.validationErrors?.[0]?.path).toBe('response.ok');
    });

    it('throws when auth is required but disabled', () => {
        expect(() =>
            createHonoServer({
                name: 'AuthDisabled',
                routes: {
                    '/secure': {
                        get: route({
                            authorized: true,
                            handler: (c) => c.json({ ok: true }),
                        }),
                    },
                },
            })
        ).toThrow('requires auth but auth is disabled');
    });

    it('applies auth middleware when enabled', async () => {
        const authMiddleware = createQueryTokenChecker({
            service: {
                verifyToken: (token: string) => token === 'valid',
            },
        });

        const server = createHonoServer({
            name: 'AuthServer',
            auth: {
                enabled: true,
                authAll: true,
                middleware: authMiddleware,
            },
            routes: {
                '/secure': {
                    get: route({
                        handler: (c) => c.json({ ok: true }),
                    }),
                },
            },
        });

        const unauthorized = await server.app.request('http://localhost/secure');
        expect(unauthorized.status).toBe(401);

        const authorized = await server.app.request('http://localhost/secure?api-key=valid');
        expect(authorized.status).toBe(200);
    });

    it('sets isDevelopment on the context when configured', async () => {
        const server = createHonoServer<AppEnv>({
            name: 'DevServer',
            isDevelopment: true,
            routes: {
                '/dev': {
                    get: route({
                        handler: (c) => c.json({ dev: c.get('isDevelopment') }),
                    }),
                },
            },
        });

        const response = await server.app.request('http://localhost/dev');
        const body = (await response.json()) as { status: string; data: { dev: boolean } };

        expect(body.data.dev).toBe(true);
    });
});
