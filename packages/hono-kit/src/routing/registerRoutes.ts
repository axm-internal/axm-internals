import type { Context, Hono, MiddlewareHandler } from 'hono';

import type { NormalizedRouteDefinition, RoutesCollection } from '../server/RoutesCollection';
import type { AppEnv } from '../server/types';
import { joinPaths } from '../utils/joinPaths';
import { validateInput } from '../validation/inputValidation';
import type { RouteInputSchemas, RouteInputs } from './route';

/**
 * @internal
 * Callback invoked to handle a route after inputs are built.
 *
 * @remarks
 * This enables custom route handling when registering routes.
 */
export type RegisterRouteHandler<T extends AppEnv = AppEnv> = (params: {
    route: NormalizedRouteDefinition;
    input: RouteInputs<RouteInputSchemas>;
    context: Context<T>;
}) => Response | Promise<Response>;

/**
 * @internal
 * Resolve middleware for a specific route.
 *
 * @remarks
 * Used to attach per-route middleware when registering routes.
 */
export type RegisterRouteMiddleware<T extends AppEnv = AppEnv> = (
    route: NormalizedRouteDefinition
) => MiddlewareHandler<T>[] | undefined;

/**
 * @internal
 * Parse a JSON body from the request if present.
 *
 * @param c - Request context.
 * @returns Parsed JSON or `undefined` when parsing fails.
 * @remarks
 * Parsing failures are swallowed to allow optional JSON bodies.
 */
const readJsonBody = async <T extends AppEnv>(c: Context<T>): Promise<unknown> => {
    try {
        return await c.req.json();
    } catch {
        return undefined;
    }
};

/**
 * @internal
 * Build typed route inputs using the supplied schemas.
 *
 * @param c - Hono request context.
 * @param schemas - Input schemas for params, query, headers, and body.
 * @returns Validated input data for the route handler.
 * @remarks
 * Each input is validated with the matching Zod schema when provided.
 */
export const buildRouteInputs = async <T extends AppEnv>(
    c: Context<T>,
    schemas: RouteInputSchemas
): Promise<RouteInputs<RouteInputSchemas>> => {
    const params = schemas.params
        ? validateInput({ source: 'params', schema: schemas.params, value: c.req.param() })
        : undefined;
    const query = schemas.query
        ? validateInput({ source: 'query', schema: schemas.query, value: c.req.query() })
        : undefined;
    const headers = schemas.headers
        ? validateInput({ source: 'headers', schema: schemas.headers, value: c.req.header() })
        : undefined;
    const body = schemas.body
        ? validateInput({ source: 'body', schema: schemas.body, value: await readJsonBody(c) })
        : undefined;

    return {
        params,
        query,
        headers,
        body,
    };
};

/**
 * Register a collection of routes on a Hono application.
 *
 * @param params - Application, routes, and optional hooks for registration.
 * @returns Nothing.
 * @remarks
 * Routes are normalized and registered with optional middleware and custom handlers.
 * @example
 * ```ts
 * registerRoutes({ app, routes, routePrefix: '/api' });
 * ```
 */
export const registerRoutes = <T extends AppEnv>(params: {
    app: Hono<T>;
    routes: RoutesCollection;
    routePrefix?: string;
    handleRoute?: RegisterRouteHandler<T>;
    getRouteMiddlewares?: RegisterRouteMiddleware<T>;
}): void => {
    const register = params.app.on.bind(params.app) as (
        method: string,
        path: string,
        ...handlers: MiddlewareHandler<T>[]
    ) => void;

    for (const route of params.routes.items) {
        const path = joinPaths(params.routePrefix, route.path);
        const middlewares = params.getRouteMiddlewares?.(route) ?? [];
        register(route.method, path, ...middlewares, async (c) => {
            const input = await buildRouteInputs(c as Context<T>, route.schemas);
            if (params.handleRoute) {
                return params.handleRoute({ route, input, context: c as Context<T> });
            }

            return route.handler(c as unknown as Context<AppEnv>, input);
        });
    }
};
