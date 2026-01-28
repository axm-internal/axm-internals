import { describe, expect, it } from 'bun:test';

import { getIsDevelopment } from '../../../src/index';
import type { AppEnv } from '../../../src/server/types';

const createContext = (isDevelopment?: unknown) =>
    ({
        get: (key: string) => {
            if (key === 'isDevelopment') return isDevelopment;
            return undefined;
        },
    }) as unknown as import('hono').Context<AppEnv>;

describe('getIsDevelopment', () => {
    it('returns true when set', () => {
        const ctx = createContext(true);
        expect(getIsDevelopment(ctx)).toBe(true);
    });

    it('returns false when missing', () => {
        const ctx = createContext(undefined);
        expect(getIsDevelopment(ctx)).toBe(false);
    });

    it('coerces truthy values', () => {
        const ctx = createContext('yes');
        expect(getIsDevelopment(ctx)).toBe(true);
    });
});
