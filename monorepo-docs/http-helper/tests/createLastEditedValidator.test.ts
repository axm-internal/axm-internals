import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';
import { createLastEditedValidator } from '../src/middleware/createLastEditedValidator';

const fixedDate = new Date('2025-01-01T00:00:00.000Z');

const createFakeRepo = (overrides?: { getLastModifiedAt?: () => Promise<Date | null> }) => {
    return {
        getLastModifiedAt: overrides?.getLastModifiedAt ?? (async () => fixedDate),
    } as { getLastModifiedAt: () => Promise<Date | null> };
};

describe('createLastEditedValidator', () => {
    it('stamps headers and short-circuits with 304 on matching ETags', async () => {
        const repo = createFakeRepo();
        const app = new Hono();
        app.use(createLastEditedValidator({ sources: [{ repo }], memoizeMs: 0 }));
        app.get('/records', (c) => c.json({ ok: true }));

        const firstResponse = await app.request('http://test/records?brand=nike&page=2');
        expect(firstResponse.status).toBe(200);
        const etag = firstResponse.headers.get('ETag');
        expect(etag).toBeTruthy();
        expect(firstResponse.headers.get('Last-Modified')).toBe(fixedDate.toUTCString());

        const cachedResponse = await app.request('http://test/records?page=2&brand=nike', {
            headers: {
                'If-None-Match': etag ?? '',
            },
        });

        expect(cachedResponse.status).toBe(304);
        expect(cachedResponse.headers.get('ETag')).toBe(etag);
    });

    it('skips non-GET requests and does not query repositories', async () => {
        let callCount = 0;
        const repo = createFakeRepo({
            getLastModifiedAt: async () => {
                callCount += 1;
                return fixedDate;
            },
        });

        const app = new Hono();
        app.use(createLastEditedValidator({ sources: [{ repo }], memoizeMs: 0 }));
        app.post('/records', (c) => c.text('created', 201));

        const response = await app.request('http://test/records', { method: 'POST' });
        expect(response.status).toBe(201);
        expect(callCount).toBe(0);
    });
});
