import type { Context, MiddlewareHandler } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { HTTPException } from 'hono/http-exception';

import type { AppEnv } from '../server/types';
import type { CreateBearerTokenCheckerParams } from './types';

export const createBearerTokenChecker = <TEnv extends AppEnv = AppEnv>(
    params: CreateBearerTokenCheckerParams<TEnv>
): MiddlewareHandler<TEnv> => {
    const { service, options, onUnauthorized } = params;

    const middleware = bearerAuth({
        ...options,
        verifyToken: (token, c) => service.verifyToken(token, c as Context<TEnv>),
    });

    return async (c, next) => {
        try {
            await middleware(c, next);
        } catch (error) {
            if (onUnauthorized && error instanceof HTTPException && (error.status === 400 || error.status === 401)) {
                return onUnauthorized(c);
            }

            throw error;
        }
    };
};
