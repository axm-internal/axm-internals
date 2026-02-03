import type { Context, MiddlewareHandler } from 'hono';
import type { bearerAuth } from 'hono/bearer-auth';

import type { AppEnv } from '../server/types';

/**
 * Options passed through to `hono/bearer-auth`.
 *
 * @remarks
 * Use this to configure the underlying bearer-auth middleware behavior.
 * @example
 * ```ts
 * const options: BearerAuthOptions = { prefix: 'Bearer' };
 * ```
 */
export type BearerAuthOptions = Parameters<typeof bearerAuth>[0];

/**
 * Options for query-parameter token authentication.
 *
 * @remarks
 * Use `paramKey` to customize the query string key used for the token.
 * @example
 * ```ts
 * const options: QueryAuthOptions = { paramKey: 'api-key' };
 * ```
 */
export type QueryAuthOptions = {
    paramKey?: string;
};

/**
 * Verifies whether a token is valid for the current request.
 *
 * @remarks
 * Implementations can be synchronous or async.
 * @example
 * ```ts
 * const verifier: TokenVerifier = {
 *   verifyToken: (token) => token === 'secret',
 * };
 * ```
 */
export type TokenVerifier<TEnv extends AppEnv = AppEnv> = {
    verifyToken: (token: string, c: Context<TEnv>) => boolean | Promise<boolean>;
};

/**
 * Produces a response when authentication fails.
 *
 * @remarks
 * This allows custom error payloads or redirects for unauthorized requests.
 * @example
 * ```ts
 * const onUnauthorized: UnauthorizedHandler = (c) => c.text('Unauthorized', 401);
 * ```
 */
export type UnauthorizedHandler<TEnv extends AppEnv = AppEnv> = (c: Context<TEnv>) => Response | Promise<Response>;

/**
 * Parameters for building a bearer-token checker middleware.
 *
 * @remarks
 * Provide a token verifier and optional unauthorized handler.
 * @example
 * ```ts
 * const params: CreateBearerTokenCheckerParams = {
 *   service: { verifyToken: (token) => token === 'secret' },
 * };
 * ```
 */
export type CreateBearerTokenCheckerParams<TEnv extends AppEnv = AppEnv> = {
    service: TokenVerifier<TEnv>;
    options?: Omit<BearerAuthOptions, 'token' | 'verifyToken'>;
    onUnauthorized?: UnauthorizedHandler<TEnv>;
};

/**
 * Parameters for building a query-token checker middleware.
 *
 * @remarks
 * The token will be read from the query string using the configured key.
 * @example
 * ```ts
 * const params: CreateQueryTokenCheckerParams = {
 *   service: { verifyToken: async () => true },
 *   options: { paramKey: 'api-key' },
 * };
 * ```
 */
export type CreateQueryTokenCheckerParams<TEnv extends AppEnv = AppEnv> = {
    service: TokenVerifier<TEnv>;
    options?: QueryAuthOptions;
    onUnauthorized?: UnauthorizedHandler<TEnv>;
};

/**
 * Parameters for composing multiple auth middlewares.
 *
 * @remarks
 * Middlewares run in order until one authenticates or returns a response.
 * @example
 * ```ts
 * const params: CreateCompositeTokenAuthParams = {
 *   middlewares: [bearerAuthMiddleware, queryAuthMiddleware],
 * };
 * ```
 */
export type CreateCompositeTokenAuthParams<TEnv extends AppEnv = AppEnv> = {
    middlewares: MiddlewareHandler<TEnv>[];
    onUnauthorized?: UnauthorizedHandler<TEnv>;
};
