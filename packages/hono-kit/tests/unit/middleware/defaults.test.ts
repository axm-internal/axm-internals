import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import type { Logger } from 'pino';

import type { AppEnv } from '../../../src/index';
import { createDefaultMiddlewares, createRequestLogger, createRequestTracking } from '../../../src/index';

describe('createDefaultMiddlewares', () => {
    it('builds default middlewares with logger and options', () => {
        const logger = { info: () => undefined } as unknown as Logger;
        const middlewares = createDefaultMiddlewares({ cors: true, secureHeaders: true }, { logger });

        expect(middlewares).toHaveLength(5);
    });

    it('skips request logger when logger is missing', () => {
        const middlewares = createDefaultMiddlewares();

        expect(middlewares).toHaveLength(2);
    });
});

describe('request middleware', () => {
    it('tracks request id and start time', async () => {
        const app = new Hono<AppEnv>();

        app.use('*', createRequestTracking());
        app.get('/tracked', (c) =>
            c.json({
                requestId: c.get('requestId'),
                hasStartTime: typeof c.get('requestStartTime') === 'number',
            })
        );

        const response = await app.request('http://localhost/tracked', {
            headers: {
                'x-request-id': 'req-123',
            },
        });

        const body = (await response.json()) as { requestId: string; hasStartTime: boolean };

        expect(body.requestId).toBe('req-123');
        expect(body.hasStartTime).toBe(true);
    });

    it('logs request metadata', async () => {
        const logs: Array<{ obj: Record<string, unknown>; msg?: string }> = [];
        const logger = {
            info: (obj: Record<string, unknown>, msg?: string) => {
                logs.push({ obj, msg });
            },
        } as unknown as Logger;

        const app = new Hono<AppEnv>();

        app.use('*', createRequestTracking());
        app.use('*', createRequestLogger({ logger }));
        app.get('/logged', (c) => {
            c.status(201);
            return c.json({ ok: true });
        });

        const response = await app.request('http://localhost/logged', {
            headers: {
                'x-request-id': 'req-999',
            },
        });

        await response.json();

        expect(logs).toHaveLength(1);

        const entry = logs[0];
        expect(entry?.msg).toBe('request');
        expect(entry?.obj.requestId).toBe('req-999');
        expect(entry?.obj.method).toBe('GET');
        expect(entry?.obj.path).toBe('/logged');
        expect(entry?.obj.status).toBe(201);
        expect(typeof entry?.obj.durationMs).toBe('number');
    });
});
