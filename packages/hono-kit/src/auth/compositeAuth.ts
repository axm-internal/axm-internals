import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import type { AppEnv } from '../server/types';
import type { CreateCompositeTokenAuthParams } from './types';

/**
 * @internal
 * Determine whether an auth error should be ignored and allow fallback auth strategies.
 *
 * @param error - Error thrown by an auth middleware.
 * @returns `true` when the error represents an auth failure that can be retried.
 * @remarks
 * Only 400 and 401 HTTP exceptions are considered ignorable here.
 */
const isIgnorableAuthError = (error: unknown): error is HTTPException =>
    error instanceof HTTPException && (error.status === 400 || error.status === 401);

/**
 * Compose multiple auth middlewares and fall back until one succeeds.
 *
 * @param params - Middleware list and unauthorized handler options.
 * @returns A middleware that runs each auth strategy in order.
 * @remarks
 * Any middleware that calls `next` or returns a response is treated as the winning auth strategy.
 * @example
 * ```ts
 * const auth = createCompositeTokenAuth({
 *   middlewares: [bearerAuthMiddleware, queryAuthMiddleware],
 * });
 * ```
 */
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
