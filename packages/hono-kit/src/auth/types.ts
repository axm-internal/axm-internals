import type { Context, MiddlewareHandler } from 'hono';
import type { bearerAuth } from 'hono/bearer-auth';

import type { AppEnv } from '../server/types';

export type BearerAuthOptions = Parameters<typeof bearerAuth>[0];

export type QueryAuthOptions = {
    paramKey?: string;
};

export type TokenVerifier<TEnv extends AppEnv = AppEnv> = {
    verifyToken: (token: string, c: Context<TEnv>) => boolean | Promise<boolean>;
};

export type UnauthorizedHandler<TEnv extends AppEnv = AppEnv> = (c: Context<TEnv>) => Response | Promise<Response>;

export type CreateBearerTokenCheckerParams<TEnv extends AppEnv = AppEnv> = {
    service: TokenVerifier<TEnv>;
    options?: Omit<BearerAuthOptions, 'token' | 'verifyToken'>;
    onUnauthorized?: UnauthorizedHandler<TEnv>;
};

export type CreateQueryTokenCheckerParams<TEnv extends AppEnv = AppEnv> = {
    service: TokenVerifier<TEnv>;
    options?: QueryAuthOptions;
    onUnauthorized?: UnauthorizedHandler<TEnv>;
};

export type CreateCompositeTokenAuthParams<TEnv extends AppEnv = AppEnv> = {
    middlewares: MiddlewareHandler<TEnv>[];
    onUnauthorized?: UnauthorizedHandler<TEnv>;
};
