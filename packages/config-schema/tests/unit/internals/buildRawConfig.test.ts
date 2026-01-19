import { afterEach, describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { autoEnv, env } from '../../../src';
import { buildRawConfig } from '../../../src/internal/buildRawConfig';
import { walkSchema } from '../../../src/internal/walkSchema';

const setEnv = (key: string, value?: string) => {
    if (value === undefined) {
        delete process.env[key];
        return;
    }
    process.env[key] = value;
};

describe('buildRawConfig', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('uses explicit env bindings when set', () => {
        setEnv('LOGGER_PATH', '/tmp/logs');

        const schema = z.object({
            logger: z.object({
                path: env('LOGGER_PATH', z.string()),
            }),
        });

        const tree = walkSchema(schema);
        const raw = buildRawConfig(tree) as { logger: { path: string } };

        expect(raw.logger.path).toBe('/tmp/logs');
    });

    it('infers env names for auto bindings', () => {
        setEnv('DB_URL', 'postgres://example');

        const schema = z.object({
            db: z.object({
                url: autoEnv(z.string()),
            }),
        });

        const tree = walkSchema(schema);
        const raw = buildRawConfig(tree) as { db: { url: string } };

        expect(raw.db.url).toBe('postgres://example');
    });

    it('omits optional env values when missing', () => {
        setEnv('OPTIONAL_VALUE', undefined);

        const schema = z.object({
            optionalValue: env('OPTIONAL_VALUE', z.string()).optional(),
        });

        const tree = walkSchema(schema);
        const raw = buildRawConfig(tree) as { optionalValue?: string };

        expect('optionalValue' in raw).toBeFalse();
    });

    it('sets required env values to undefined when missing', () => {
        setEnv('REQUIRED_VALUE', undefined);

        const schema = z.object({
            requiredValue: env('REQUIRED_VALUE', z.string()),
        });

        const tree = walkSchema(schema);
        const raw = buildRawConfig(tree) as { requiredValue?: string };

        expect('requiredValue' in raw).toBeTrue();
        expect(raw.requiredValue).toBeUndefined();
    });

    it('omits optional objects when no child values are present', () => {
        setEnv('OPTIONAL_URL', undefined);

        const schema = z.object({
            optionalBlock: z
                .object({
                    url: env('OPTIONAL_URL', z.string()),
                })
                .optional(),
        });

        const tree = walkSchema(schema);
        const raw = buildRawConfig(tree) as { optionalBlock?: { url?: string } };

        expect(raw.optionalBlock).toBeUndefined();
    });
});
