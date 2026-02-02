import { describe, expect, it } from 'bun:test';
import { Hono } from 'hono';

import type { AppEnv } from '../../../src/index';
import { RoutesCollection, registerRoutes, route } from '../../../src/index';

describe('RoutesCollection', () => {
    it('normalizes routes object into route definitions', () => {
        const routes = {
            '/health': {
                get: route({
                    handler: () => new Response('ok'),
                }),
            },
        };

        const collection = new RoutesCollection(routes);

        expect(collection.items).toHaveLength(1);
        expect(collection.items[0]?.method).toBe('get');
        expect(collection.items[0]?.path).toBe('/health');
        expect(collection.toJSON()).toEqual([
            {
                method: 'get',
                path: '/health',
                authorized: undefined,
            },
        ]);
    });

    it('throws when array routes omit method or path', () => {
        const routes = [
            route({
                path: '/users',
                handler: () => new Response('ok'),
            }),
        ];

        expect(() => new RoutesCollection(routes)).toThrow('Routes in array form must include both method and path.');
    });

    it('throws when route method conflicts with object key', () => {
        const routes = {
            '/users': {
                get: route({
                    method: 'post',
                    handler: () => new Response('ok'),
                }),
            },
        };

        expect(() => new RoutesCollection(routes)).toThrow('Route method mismatch for "/users" (get).');
    });
});

describe('registerRoutes', () => {
    it('registers routes on a Hono instance with a prefix', async () => {
        const routes = {
            '/health': {
                get: route({
                    handler: () => new Response('ok'),
                }),
            },
        };

        const collection = new RoutesCollection(routes);
        const app = new Hono<AppEnv>();

        registerRoutes({
            app,
            routes: collection,
            routePrefix: '/api',
        });

        const response = await app.request('http://localhost/api/health');
        expect(await response.text()).toBe('ok');
    });
});
