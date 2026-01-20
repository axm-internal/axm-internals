import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../types';
import type { CreateQueryTokenCheckerParams } from './types';

export const createQueryTokenChecker = <T extends AppEnv = AppEnv>({
    service,
    paramKey = 'api-key',
    exceptionOptions,
}: CreateQueryTokenCheckerParams<T>) =>
    createMiddleware<T>(async (c, next) => {
        const token = c.req.query(paramKey);
        if (!token) {
            return;
        }
        const isValid = await service.verify(token, c);
        if (!isValid) {
            throw new HTTPException(401, {
                message: 'Unauthorized',
                ...exceptionOptions,
            });
        }
        await next();
    });
