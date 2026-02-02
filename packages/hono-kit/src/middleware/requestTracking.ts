import type { MiddlewareHandler } from 'hono';

import type { AppEnv } from '../server/types';

const REQUEST_ID_HEADER = 'x-request-id';

const generateRequestId = (): string => {
    if (globalThis.crypto?.randomUUID) {
        return globalThis.crypto.randomUUID();
    }

    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

const getHeaderRequestId = (c: { req: { header: (name: string) => string | undefined } }): string | undefined => {
    const headerValue = c.req.header(REQUEST_ID_HEADER);
    if (typeof headerValue === 'string' && headerValue.length > 0) {
        return headerValue;
    }

    return undefined;
};

const normalizeRequestId = (requestId: unknown): string | undefined => {
    if (typeof requestId === 'string' && requestId.length > 0) {
        return requestId;
    }

    return undefined;
};

export const createRequestTracking = (): MiddlewareHandler<AppEnv> => async (c, next) => {
    const existingRequestId = normalizeRequestId(c.get('requestId'));
    const headerRequestId = getHeaderRequestId(c);
    const requestId = existingRequestId ?? headerRequestId ?? generateRequestId();

    if (!existingRequestId) {
        c.set('requestId', requestId);
    }

    c.set('requestStartTime', Date.now());

    await next();
};
