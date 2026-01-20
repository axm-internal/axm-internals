import { describe, expect, it, mock } from 'bun:test';
import { Hono } from 'hono';
import type { AppEnv, TokenVerifier } from '../src';
import { createBearerTokenChecker } from '../src';

describe('createBearerTokenChecker', () => {
    const createService = (result: boolean) => {
        const verifyTokenMock = mock(async () => result);
        return {
            service: {
                verify: verifyTokenMock,
            } as TokenVerifier<AppEnv>,
            verifyTokenMock,
        };
    };

    it('forwards the request token and context to the provided service', async () => {
        const { service, verifyTokenMock } = createService(true);
        const middleware = createBearerTokenChecker({
            service,
            headerName: 'x-api-token',
        });
        const app = new Hono<AppEnv>();
        app.use('*', middleware);
        app.get('/', (c) => c.json({ ok: true }));

        const response = await app.request('/', {
            headers: {
                'x-api-token': 'Bearer abc123',
            },
        });

        expect(response.status).toBe(200);
        expect(response.headers.get('content-type')).toContain('application/json');
        expect(verifyTokenMock).toHaveBeenCalledTimes(1);
        expect(verifyTokenMock).toHaveBeenCalledWith('abc123', expect.anything());
    });

    it('returns 401 when the service rejects the provided token', async () => {
        const { service, verifyTokenMock } = createService(false);
        const middleware = createBearerTokenChecker({
            service,
            headerName: 'x-api-token',
        });
        const app = new Hono<AppEnv>();
        app.use('*', middleware);
        app.get('/', (c) => c.json({ ok: true }));

        const response = await app.request('/', {
            headers: {
                'x-api-token': 'Bearer invalid',
            },
        });

        expect(response.status).toBe(401);
        expect(verifyTokenMock).toHaveBeenCalledTimes(1);
    });
});
