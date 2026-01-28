import type { Context } from 'hono';

import type { AppEnv } from './types';

export const getIsDevelopment = <T extends AppEnv>(c: Context<T>): boolean => {
    const isDevelopment = c.get('isDevelopment');
    return Boolean(isDevelopment);
};
