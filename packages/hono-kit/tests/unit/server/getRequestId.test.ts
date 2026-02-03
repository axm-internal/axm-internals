import { describe, expect, it } from 'bun:test';

import { getRequestId } from '../../../src/index';
import type { AppEnv } from '../../../src/server/types';

const createContext = (requestId?: unknown) =>
    ({
        get: (key: string) => {
            if (key === 'requestId') return requestId;
            return undefined;
        },
    }) as unknown as import('hono').Context<AppEnv>;

describe('getRequestId', () => {
    it('returns the request id when present', () => {
        const ctx = createContext('req-1');
        expect(getRequestId(ctx)).toBe('req-1');
    });

    it('falls back to unknown when missing', () => {
        const ctx = createContext(undefined);
        expect(getRequestId(ctx)).toBe('unknown');
    });

    it('falls back to unknown when empty', () => {
        const ctx = createContext('');
        expect(getRequestId(ctx)).toBe('unknown');
    });
});
