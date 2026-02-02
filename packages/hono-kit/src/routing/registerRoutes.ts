import type { Context, Hono } from 'hono';

import type { RoutesCollection } from '../server/RoutesCollection';
import type { AppEnv } from '../server/types';
import { validateInput } from '../validation/inputValidation';
import type { RouteInputSchemas, RouteInputs } from './route';

const readJsonBody = async <T extends AppEnv>(c: Context<T>): Promise<unknown> => {
    try {
        return await c.req.json();
    } catch {
        return undefined;
    }
};

const buildRouteInputs = async <T extends AppEnv>(
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

const joinPaths = (prefix: string | undefined, path: string): string => {
    if (!prefix) {
        return path;
    }

    const normalizedPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (!normalizedPrefix) {
        return normalizedPath || '/';
    }

    return `${normalizedPrefix}${normalizedPath}`;
};

export const registerRoutes = <T extends AppEnv>(params: {
    app: Hono<T>;
    routes: RoutesCollection;
    routePrefix?: string;
}): void => {
    for (const route of params.routes.items) {
        const path = joinPaths(params.routePrefix, route.path);
        params.app.on(route.method, path, async (c) =>
            route.handler(c as unknown as Context<AppEnv>, await buildRouteInputs(c, route.schemas))
        );
    }
};
