import type { Context } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import type { AppEnv } from '../types';
import type { CreateBearerTokenCheckerParams } from './types';

export const createBearerTokenChecker = <T extends AppEnv = AppEnv>({
    service,
    ...options
}: CreateBearerTokenCheckerParams<T>) => {
    return bearerAuth({
        ...options,
        verifyToken: async (token: string, c: Context<AppEnv>) => {
            return service.verify(token, c as unknown as Context<T>);
        },
    });
};
