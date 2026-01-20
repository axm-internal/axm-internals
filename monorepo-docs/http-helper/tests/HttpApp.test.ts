import { describe, expect, it, mock } from 'bun:test';
import type { serve } from 'bun';
import { Hono, type MiddlewareHandler, type NotFoundHandler } from 'hono';
import type { Logger } from 'pino';
import pino from 'pino';
import type { AppEnv, HttpAppParams } from '../src';
import { HttpApp } from '../src';

class TestableHttpApp<T extends AppEnv = AppEnv> extends HttpApp<T> {
    public getLogger(): Logger {
        return this.logger;
    }

    public getRoutePrefix(): string {
        return this.routePrefix;
    }

    public getHonoApp(): Hono<T> {
        return this.honoApp;
    }

    public getMiddlewareCount(): number {
        return this.middlewareCollection.length;
    }

    public getMiddlewares(): MiddlewareHandler[] {
        return [...this.middlewareCollection];
    }
}

const createTestLogger = (name: string): Logger => pino({ enabled: false }).child({ module: name });

const createHttpApp = (overrides?: Partial<HttpAppParams<AppEnv>>) =>
    new TestableHttpApp<AppEnv>({
        name: 'http-helper',
        routes: new Hono<AppEnv>(),
        ...overrides,
    });

describe('HttpApp', () => {
    it('reuses a provided Hono application instance', () => {
        const providedHonoApp = new Hono<AppEnv>();
        const app = createHttpApp({ honoApp: providedHonoApp });

        expect(app.getHonoApp()).toBe(providedHonoApp);
    });

    it('defaults the route prefix to "/" when none is provided', () => {
        const app = createHttpApp();

        expect(app.getRoutePrefix()).toBe('/');
    });

    it('uses the provided logger when one is supplied', () => {
        const customLogger = createTestLogger('custom');
        const app = createHttpApp({ logger: customLogger });

        expect(app.getLogger()).toBe(customLogger);
    });

    it('creates a default logger when none is provided', () => {
        const app = createHttpApp();
        const logger = app.getLogger();

        expect(logger).toBeDefined();
        expect(logger.bindings().module).toBe('http-helper');
    });

    it('clones the provided middleware collection to avoid external mutation', () => {
        const sharedCollection: MiddlewareHandler[] = [
            (async (_c, next) => {
                await next();
            }) as MiddlewareHandler,
        ];

        const app = createHttpApp({ middlewareCollection: sharedCollection });

        expect(app.getMiddlewareCount()).toBe(1);
        expect(sharedCollection).toHaveLength(1);

        app.addTrimTrailingSlash();

        expect(app.getMiddlewareCount()).toBe(2);
        expect(sharedCollection).toHaveLength(1);
    });

    it('raises when name is missing', () => {
        expect(
            () =>
                new HttpApp<AppEnv>({
                    name: '',
                    routes: new Hono<AppEnv>(),
                })
        ).toThrow(/name/i);
    });

    it('raises when routes is not provided', () => {
        expect(
            () =>
                new HttpApp<AppEnv>({
                    name: 'http-helper',
                    routes: undefined as unknown as Hono<AppEnv>,
                })
        ).toThrow(/Hono instance/i);
    });
    it('applies a custom not found handler when provided', async () => {
        const notFoundHandler: NotFoundHandler<AppEnv> = (c) => c.text('custom-not-found', 418);
        const app = createHttpApp({ notFoundHandler });

        const hono = app.init();

        const response = await hono.request('/missing');

        expect(response.status).toBe(418);
        expect(await response.text()).toBe('custom-not-found');
    });

    it('automatically adds request tracking when request logging is enabled', () => {
        const app = createHttpApp();

        app.addRequestLogger();

        expect(app.getMiddlewareCount()).toBe(2);
    });

    it('does not duplicate request tracking when added manually before the logger', () => {
        const app = createHttpApp();

        app.addRequestTracking().addRequestLogger();

        expect(app.getMiddlewareCount()).toBe(2);
    });

    it('applies default middleware bundle once and is idempotent', () => {
        const app = createHttpApp();

        app.withDefaultMiddleware();

        expect(app.getMiddlewareCount()).toBe(5);

        app.withDefaultMiddleware();

        expect(app.getMiddlewareCount()).toBe(5);
    });

    it('executes server lifecycle hooks when starting and stopping', async () => {
        const app = createHttpApp();
        const stopMock = mock(async () => {});
        const fakeServer = { stop: stopMock } as unknown as ReturnType<typeof serve>;
        const serveMock = mock(() => fakeServer);
        const hookCalls: string[] = [];

        const { stop } = await app.startServer({
            hostname: '127.0.0.1',
            port: 0,
            serverFactory: serveMock as typeof serve,
            lifecycleHooks: {
                beforeStart: () => {
                    hookCalls.push('beforeStart');
                },
                afterStart: ({ server }) => {
                    expect(server).toBe(fakeServer);
                    hookCalls.push('afterStart');
                },
                beforeStop: ({ reason }) => {
                    hookCalls.push(`beforeStop:${reason}`);
                },
                afterStop: ({ reason }) => {
                    hookCalls.push(`afterStop:${reason}`);
                },
            },
        });

        expect(serveMock).toHaveBeenCalledTimes(1);

        await stop('SIGTERM');

        expect(stopMock).toHaveBeenCalledTimes(1);
        expect(hookCalls).toEqual(['beforeStart', 'afterStart', 'beforeStop:SIGTERM', 'afterStop:SIGTERM']);
    });

    it('reuses lifecycle hooks defined on construction when lifecycleHooks are omitted at start time', async () => {
        const stopMock = mock(async () => {});
        const fakeServer = { stop: stopMock } as unknown as ReturnType<typeof serve>;
        const serveMock = mock(() => fakeServer);
        const hookCalls: string[] = [];
        const app = createHttpApp({
            lifecycleHooks: {
                beforeStart: () => {
                    hookCalls.push('beforeStart');
                },
                afterStart: () => {
                    hookCalls.push('afterStart');
                },
                beforeStop: ({ reason }) => {
                    hookCalls.push(`beforeStop:${reason}`);
                },
                afterStop: ({ reason }) => {
                    hookCalls.push(`afterStop:${reason}`);
                },
            },
        });

        const { stop } = await app.start({
            hostname: '127.0.0.1',
            port: 0,
            serverFactory: serveMock as typeof serve,
        });

        expect(serveMock).toHaveBeenCalledTimes(1);

        await stop('SIGTERM');

        expect(stopMock).toHaveBeenCalledTimes(1);
        expect(hookCalls).toEqual(['beforeStart', 'afterStart', 'beforeStop:SIGTERM', 'afterStop:SIGTERM']);
    });
});
