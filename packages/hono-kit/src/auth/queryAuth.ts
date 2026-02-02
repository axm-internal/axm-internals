import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import type { AppEnv } from '../server/types';
import type { CreateQueryTokenCheckerParams } from './types';

const DEFAULT_PARAM_KEY = 'api-key';

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

            await next();
        } catch (error) {
            if (onUnauthorized && error instanceof HTTPException && (error.status === 400 || error.status === 401)) {
                return onUnauthorized(c);
            }

            throw error;
        }
    };
};
