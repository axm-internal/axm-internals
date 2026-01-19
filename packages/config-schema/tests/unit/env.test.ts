import { describe, expect, it } from 'bun:test';
import { getMetaValue } from '@axm-internal/zod-helpers';
import { z } from 'zod';
import { autoEnv, env } from '../../src';

describe('env', () => {
    it('adds explicit env metadata to a schema node', () => {
        const schema = env('LOG_LEVEL', z.string());
        const envValue = getMetaValue(schema, 'env');
        expect(envValue).toBe('LOG_LEVEL');
    });
});

describe('autoEnv', () => {
    it('adds auto env metadata to a schema node', () => {
        const schema = autoEnv(z.string());
        const envValue = getMetaValue(schema, 'env');
        expect(envValue).toBe('auto');
    });
});
