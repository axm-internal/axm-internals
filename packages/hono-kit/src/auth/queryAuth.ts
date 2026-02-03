import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import type { AppEnv } from '../server/types';
import type { CreateQueryTokenCheckerParams } from './types';

/**
 * @internal
 * Default query parameter key used to read API tokens.
 *
 * @remarks
 * This can be overridden via `QueryAuthOptions.paramKey`.
 */
const DEFAULT_PARAM_KEY = 'api-key';

/**
 * Create a query-parameter token authentication middleware.
 *
 * @param params - Configuration for verifying tokens and handling unauthorized responses.
 * @returns A Hono middleware that enforces query token authentication.
 * @remarks
 * Reads the token from the configured query parameter and delegates verification to the service.
 * @example
 * ```ts
 * const auth = createQueryTokenChecker({
 *   service: { verifyToken: async (token) => token.startsWith('key_') },
 *   options: { paramKey: 'api-key' },
 * });
 * ```
 */
export const createQueryTokenChecker = <TEnv extends AppEnv = AppEnv>(
    params: CreateQueryTokenCheckerParams<TEnv>
): MiddlewareHandler<TEnv> => {
    const { service, options, onUnauthorized } = params;
    const paramKey = options?.paramKey ?? DEFAULT_PARAM_KEY;

    return async (c, next) => {
        const token = c.req.query(paramKey);

        try {
            if (!token) {
                throw new HTTPException(401, { message: 'Unauthorized' });
            }

            const isValid = await service.verifyToken(token, c);
            if (!isValid) {
                throw new HTTPException(401, { message: 'Unauthorized' });
            }
        } catch (error) {
            if (onUnauthorized && error instanceof HTTPException && (error.status === 400 || error.status === 401)) {
                return onUnauthorized(c);
            }

            throw error;
        }

        await next();
    };
};
