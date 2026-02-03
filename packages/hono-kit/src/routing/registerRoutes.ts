import type { Context, Hono, MiddlewareHandler } from 'hono';

import type { NormalizedRouteDefinition, RoutesCollection } from '../server/RoutesCollection';
import type { AppEnv } from '../server/types';
import { joinPaths } from '../utils/joinPaths';
import { validateInput } from '../validation/inputValidation';
import type { RouteInputSchemas, RouteInputs } from './route';

export type RegisterRouteHandler<T extends AppEnv = AppEnv> = (params: {
    route: NormalizedRouteDefinition;
    input: RouteInputs<RouteInputSchemas>;
    context: Context<T>;
}) => Response | Promise<Response>;

export type RegisterRouteMiddleware<T extends AppEnv = AppEnv> = (
    route: NormalizedRouteDefinition
) => MiddlewareHandler<T>[] | undefined;

const readJsonBody = async <T extends AppEnv>(c: Context<T>): Promise<unknown> => {
    try {
        return await c.req.json();
    } catch {
        return undefined;
    }
};

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
