import type { Context } from 'hono';

import type { AppEnv } from './types';

export const getRequestId = <T extends AppEnv>(c: Context<T>): string => {
    const requestId = c.get('requestId');
    if (typeof requestId === 'string' && requestId.length > 0) return requestId;
    return 'unknown';
};
