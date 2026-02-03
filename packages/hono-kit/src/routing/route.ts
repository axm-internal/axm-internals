import type { Context } from 'hono';
import type { z } from 'zod';

import type { AppEnv } from '../server/types';

/**
 * Supported HTTP methods for routes.
 *
 * @remarks
 * Includes `all` for Hono's match-all handler.
 * @example
 * ```ts
 * const method: HttpMethod = 'get';
 * ```
 */
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete' | 'options' | 'head' | 'all';

/**
 * Schemas used to validate route inputs and responses.
 *
 * @remarks
 * Provide Zod schemas for any inputs that should be validated.
 * @example
 * ```ts
 * const schemas: RouteInputSchemas = { query: z.object({ q: z.string() }) };
 * ```
 */
export type RouteInputSchemas = {
    params?: z.ZodType;
    query?: z.ZodType;
    headers?: z.ZodType;
    body?: z.ZodType;
    response?: z.ZodType;
};

/**
 * @internal
 * Infer the output type for a Zod schema or return undefined.
 *
 * @remarks
 * Used internally to build typed route input objects.
 */
type SchemaOutput<TSchema> = TSchema extends z.ZodType ? z.core.output<TSchema> : undefined;

/**
 * Typed inputs produced for a route handler.
 *
 * @remarks
 * Each property matches the output type of its schema.
 * @example
 * ```ts
 * type Inputs = RouteInputs<{ query: z.ZodType<{ q: string }> }>;
 * ```
 */
export type RouteInputs<TSchemas extends RouteInputSchemas> = {
    params: SchemaOutput<TSchemas['params']>;
    query: SchemaOutput<TSchemas['query']>;
    headers: SchemaOutput<TSchemas['headers']>;
    body: SchemaOutput<TSchemas['body']>;
};

/**
 * Handler function for a typed route.
 *
 * @remarks
 * Receives the Hono context and validated inputs.
 * @example
 * ```ts
 * const handler: RouteHandler<{ query: z.ZodType<{ q: string }> }> = (c, input) =>
 *   c.json({ query: input.query });
 * ```
 */
export type RouteHandler<TSchemas extends RouteInputSchemas, TEnv extends AppEnv = AppEnv> = (
    c: Context<TEnv>,
    input: RouteInputs<TSchemas>
) => Response | Promise<Response>;

/**
 * Definition for a single route.
 *
 * @remarks
 * Route definitions are produced by the `route()` helper.
 * @example
 * ```ts
 * const definition: RouteDefinition<RouteInputSchemas> = {
 *   kind: 'route',
 *   method: 'get',
 *   path: '/health',
 *   schemas: {},
 *   handler: (c) => c.text('ok'),
 * };
 * ```
 */
export type RouteDefinition<TSchemas extends RouteInputSchemas, TEnv extends AppEnv = AppEnv> = {
    kind: 'route';
    method?: HttpMethod;
    path?: string;
    authorized?: boolean;
    schemas: TSchemas;
    handler: RouteHandler<TSchemas, TEnv>;
};

/**
 * Convenience type for any supported route definition.
 *
 * @remarks
 * Useful when aggregating routes of different schema shapes.
 * @example
 * ```ts
 * const routes: AnyRouteDefinition[] = [route({ method: 'get', path: '/', schemas: {}, handler })];
 * ```
 */
export type AnyRouteDefinition = RouteDefinition<RouteInputSchemas, AppEnv>;

/**
 * Parameters accepted by the `route()` helper.
 *
 * @remarks
 * Use this type when building factories that generate routes.
 * @example
 * ```ts
 * const params: RouteParams<RouteInputSchemas> = {
 *   method: 'get',
 *   path: '/health',
 *   schemas: {},
 *   handler: (c) => c.text('ok'),
 * };
 * ```
 */
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

/**
 * Create a typed route definition.
 *
 * @param params - Route configuration and handler.
 * @returns A normalized route definition object.
 * @remarks
 * Use this helper to standardize route metadata for registration.
 * @example
 * ```ts
 * const definition = route({
 *   method: 'get',
 *   path: '/health',
 *   schemas: {},
 *   handler: (c) => c.text('ok'),
 * });
 * ```
 */
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
