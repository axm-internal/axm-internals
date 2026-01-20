import type { Context, Next } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../types';
import type { CreateCompositeTokenAuthParams } from './types';

const defaultUnauthorized = <T extends AppEnv>(_c: Context<T>) => {
    throw new HTTPException(401, { message: 'Unauthorized' });
};

export const createCompositeTokenAuth = <T extends AppEnv = AppEnv>({
    middlewares,
    onUnauthorized,
}: CreateCompositeTokenAuthParams<T>) => {
    if (!middlewares?.length) {
        throw new Error('createCompositeTokenAuth requires at least one middleware.');
    }

    return async (context: Context<AppEnv>, next: Next) => {
        const typedContext = context as unknown as Context<T>;

        for (const middleware of middlewares) {
            let authorized = false;
            try {
                await middleware(typedContext, async () => {
                    authorized = true;
                    await next();
                });
            } catch (error) {
                if (error instanceof HTTPException) {
                    const status = error.status ?? 500;
                    if (status === 400 || status === 401) {
                        continue;
                    }
                }
                throw error;
            }
            if (authorized) {
                return;
            }
        }

        return onUnauthorized ? onUnauthorized(typedContext) : defaultUnauthorized(typedContext);
    };
};
