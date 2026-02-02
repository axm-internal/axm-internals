import type { Context } from 'hono';
import type { z } from 'zod';

import type { AppEnv } from '../server/types';

export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head' | 'all';

export type RouteInputSchemas = {
    params?: z.ZodType;
    query?: z.ZodType;
    headers?: z.ZodType;
    body?: z.ZodType;
    response?: z.ZodType;
};

type SchemaOutput<TSchema> = TSchema extends z.ZodType ? z.core.output<TSchema> : undefined;

export type RouteInputs<TSchemas extends RouteInputSchemas> = {
    params: SchemaOutput<TSchemas['params']>;
    query: SchemaOutput<TSchemas['query']>;
    headers: SchemaOutput<TSchemas['headers']>;
    body: SchemaOutput<TSchemas['body']>;
};

export type RouteHandler<TSchemas extends RouteInputSchemas, TEnv extends AppEnv = AppEnv> = (
    c: Context<TEnv>,
    input: RouteInputs<TSchemas>
) => Response | Promise<Response>;

export type RouteDefinition<TSchemas extends RouteInputSchemas, TEnv extends AppEnv = AppEnv> = {
    kind: 'route';
    method?: HttpMethod;
    path?: string;
    authorized?: boolean;
    schemas: TSchemas;
    handler: RouteHandler<TSchemas, TEnv>;
};

export type AnyRouteDefinition = RouteDefinition<RouteInputSchemas, AppEnv>;

export type RouteParams<TSchemas extends RouteInputSchemas, TEnv extends AppEnv = AppEnv> = {
    method?: HttpMethod;
    path?: string;
    authorized?: boolean;
    params?: TSchemas['params'];
    query?: TSchemas['query'];
    headers?: TSchemas['headers'];
    body?: TSchemas['body'];
    response?: TSchemas['response'];
    handler: RouteHandler<TSchemas, TEnv>;
};

export const route = <TSchemas extends RouteInputSchemas, TEnv extends AppEnv = AppEnv>(
    params: RouteParams<TSchemas, TEnv>
): RouteDefinition<TSchemas, TEnv> => ({
    kind: 'route',
    method: params.method,
    path: params.path,
    authorized: params.authorized,
    schemas: {
        params: params.params,
        query: params.query,
        headers: params.headers,
        body: params.body,
        response: params.response,
    } as TSchemas,
    handler: params.handler,
});
