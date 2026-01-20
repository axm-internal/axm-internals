import type { Context, MiddlewareHandler } from 'hono';
import type { bearerAuth } from 'hono/bearer-auth';
import type { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../types';
import type { TokenVerifier } from './TokenVerifier';

export type CreateCompositeTokenAuthParams<T extends AppEnv = AppEnv> = {
    middlewares: readonly MiddlewareHandler<T>[];
    onUnauthorized?: (c: Context<T>) => Promise<Response> | Response;
};

type BearerAuthOptions = Parameters<typeof bearerAuth>[0];
export type CreateBearerTokenCheckerParams<T extends AppEnv = AppEnv> = Omit<BearerAuthOptions, 'verifyToken'> & {
    service: TokenVerifier<T>;
};

type HTTPExceptionOptions = ConstructorParameters<typeof HTTPException>[1];
export type CreateQueryTokenCheckerParams<T extends AppEnv = AppEnv> = {
    service: TokenVerifier<T>;
    paramKey?: string;
    exceptionOptions?: HTTPExceptionOptions;
};
