import { describe, expect, it } from 'bun:test';
import { HTTPException } from 'hono/http-exception';

import { createErrorHandler, errorEnvelope, successEnvelope } from '../../../src/index';
import type { AppEnv } from '../../../src/server/types';

const createContext = (requestId?: string, isDevelopment?: boolean) =>
    ({
        get: (key: string) => {
            if (key === 'requestId') return requestId;
            if (key === 'isDevelopment') return isDevelopment;
            return undefined;
        },
        json: (payload: unknown, status?: number) =>
            new Response(JSON.stringify(payload), {
                status: status ?? 500,
                headers: { 'content-type': 'application/json' },
            }),
    }) as unknown as import('hono').Context<AppEnv>;

describe('error envelopes', () => {
    it('builds a success envelope', () => {
        const result = successEnvelope({ requestId: 'req-1', data: { ok: true } });

        expect(result).toEqual({
            status: 'success',
            requestId: 'req-1',
            data: { ok: true },
        });
    });

    it('builds an error envelope', () => {
        const result = errorEnvelope({
            requestId: 'req-2',
            statusCode: 400,
            errorMessage: 'Invalid input',
            errorCode: 'invalid_format',
            validationErrors: [{ path: 'body.email', message: 'Invalid email' }],
        });

        expect(result).toEqual({
            status: 'error',
            requestId: 'req-2',
            statusCode: 400,
            errorCode: 'invalid_format',
            errorMessage: 'Invalid input',
            validationErrors: [{ path: 'body.email', message: 'Invalid email' }],
            errorStack: undefined,
        });
    });
});

describe('createErrorHandler', () => {
    it('wraps non-HTTPException errors', async () => {
        const handler = createErrorHandler();
        const ctx = createContext('req-3');
        const response = await Promise.resolve(handler(new Error('Boom'), ctx));
        const body = (await response.json()) as Record<string, unknown>;

        expect(response.status).toBe(500);
        expect(body).toEqual({
            status: 'error',
            requestId: 'req-3',
            statusCode: 500,
            errorMessage: 'Boom',
            validationErrors: undefined,
            errorStack: undefined,
        });
    });

    it('uses HTTPException status code', async () => {
        const handler = createErrorHandler();
        const ctx = createContext('req-4');
        const response = await Promise.resolve(handler(new HTTPException(404, { message: 'Nope' }), ctx));
        const body = (await response.json()) as Record<string, unknown>;

        expect(response.status).toBe(404);
        expect(body).toEqual({
            status: 'error',
            requestId: 'req-4',
            statusCode: 404,
            errorMessage: 'Nope',
            validationErrors: undefined,
            errorStack: undefined,
        });
    });

    it('includes error stack in development', async () => {
        const handler = createErrorHandler();
        const ctx = createContext('req-5', true);
        const response = await Promise.resolve(handler(new Error('Boom'), ctx));
        const body = (await response.json()) as Record<string, unknown>;

        expect(response.status).toBe(500);
        expect(body.errorStack).toBeDefined();
    });
});
