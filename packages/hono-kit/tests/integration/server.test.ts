import { describe, expect, it } from 'bun:test';

import { createHonoServer, createQueryTokenChecker, route } from '../../src/index';

describe('hono-kit server integration', () => {
    it('applies default middleware and route prefix', async () => {
        const server = createHonoServer({
            name: 'IntegrationServer',
            routePrefix: '/api',
            defaults: {
                cors: true,
                secureHeaders: true,
            },
            routes: {
                '/health': {
                    get: route({
                        handler: (c) => c.json({ ok: true }),
                    }),
                },
            },
        });

        const initialResponse = await server.app.request('http://localhost/api/health/', {
            headers: {
                Origin: 'http://example.com',
            },
        });

        if (initialResponse.status === 301 || initialResponse.status === 308) {
            const location = initialResponse.headers.get('location');
            expect(location).toBeTruthy();
            const redirectUrl = new URL(location ?? '/api/health', 'http://localhost');
            expect(redirectUrl.pathname).toBe('/api/health');
        }

        const response =
            initialResponse.status === 301 || initialResponse.status === 308
                ? await server.app.request('http://localhost/api/health', {
                      headers: {
                          Origin: 'http://example.com',
                      },
                  })
                : initialResponse;

        const body = (await response.json()) as {
            status: string;
            requestId: string;
            data: { ok: boolean };
        };

        expect(response.status).toBe(200);
        expect(body.status).toBe('success');
        expect(body.data.ok).toBe(true);
        expect(body.requestId).not.toBe('unknown');
        expect(response.headers.get('access-control-allow-origin')).toBeTruthy();
        expect(response.headers.get('x-content-type-options')).toBeTruthy();
    });

    it('returns error envelopes with stack in development', async () => {
        const server = createHonoServer({
            name: 'ErrorServer',
            isDevelopment: true,
            routes: {
                '/boom': {
                    get: route({
                        handler: () => {
                            throw new Error('Boom');
                        },
                    }),
                },
            },
        });

        const response = await server.app.request('http://localhost/boom');
        const body = (await response.json()) as {
            status: string;
            statusCode: number;
            requestId: string;
            errorMessage: string;
            errorStack?: string;
        };

        expect(response.status).toBe(500);
        expect(body.status).toBe('error');
        expect(body.statusCode).toBe(500);
        expect(body.errorMessage).toBe('Boom');
        expect(body.requestId).not.toBe('unknown');
        expect(body.errorStack).toBeTruthy();
    });

    it('enforces auth for protected routes while allowing public routes', async () => {
        const authMiddleware = createQueryTokenChecker({
            service: {
                verifyToken: (token: string) => token === 'valid',
            },
        });

        const server = createHonoServer({
            name: 'AuthIntegration',
            auth: {
                enabled: true,
                authAll: true,
                middleware: authMiddleware,
            },
            routes: {
                '/public': {
                    get: route({
                        authorized: false,
                        handler: (c) => c.json({ ok: true }),
                    }),
                },
                '/private': {
                    get: route({
                        authorized: true,
                        handler: (c) => c.json({ ok: true }),
                    }),
                },
            },
        });

        const publicResponse = await server.app.request('http://localhost/public');
        expect(publicResponse.status).toBe(200);

        const unauthorized = await server.app.request('http://localhost/private');
        expect(unauthorized.status).toBe(401);

        const authorized = await server.app.request('http://localhost/private?api-key=valid');
        expect(authorized.status).toBe(200);
    });
});
