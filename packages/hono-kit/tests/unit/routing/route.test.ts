import { describe, expect, it } from 'bun:test';
import { z } from 'zod';

import { route } from '../../../src/index';

describe('route', () => {
    it('builds a route definition', () => {
        const handler = () => new Response('ok');
        const definition = route({
            method: 'get',
            path: '/health',
            response: z.object({ status: z.literal('ok') }),
            handler,
        });

        expect(definition.kind).toBe('route');
        expect(definition.method).toBe('get');
        expect(definition.path).toBe('/health');
        expect(definition.schemas.response).toBeDefined();
        expect(definition.handler).toBe(handler);
    });

    it('allows optional schemas', () => {
        const definition = route({
            method: 'post',
            path: '/users',
            body: z.object({ name: z.string() }),
            handler: () => new Response('ok'),
        });

        expect(definition.schemas.body).toBeDefined();
        expect(definition.schemas.params).toBeUndefined();
    });
});
