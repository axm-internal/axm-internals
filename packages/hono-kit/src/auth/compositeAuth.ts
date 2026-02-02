import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import type { AppEnv } from '../server/types';
import type { CreateCompositeTokenAuthParams } from './types';

const isIgnorableAuthError = (error: unknown): error is HTTPException =>
    error instanceof HTTPException && (error.status === 400 || error.status === 401);

export const createCompositeTokenAuth = <TEnv extends AppEnv = AppEnv>(
    params: CreateCompositeTokenAuthParams<TEnv>
): MiddlewareHandler<TEnv> => {
    const { middlewares, onUnauthorized } = params;

    return async (c, next) => {
        for (const middleware of middlewares) {
            let didCallNext = false;

            try {
                const result = await middleware(c, async () => {
                    didCallNext = true;
                    return next();
                });

                if (didCallNext) {
                    return result;
                }

                if (result !== undefined) {
                    return result;
                }
            } catch (error) {
                if (isIgnorableAuthError(error)) {
                    continue;
                }

                throw error;
            }
        }

        if (onUnauthorized) {
            return onUnauthorized(c);
        }

        throw new HTTPException(401, { message: 'Unauthorized' });
    };
};
