import { describe, expect, it } from 'bun:test';
import { ZodError, z } from 'zod';
import { autoEnv, env } from '../../../src';
import { formatError } from '../../../src/internal/formatError';
import { walkSchema } from '../../../src/internal/walkSchema';

describe('formatError', () => {
    it('includes path and env name for explicit bindings', () => {
        const schema = z.object({
            logger: z.object({
                path: env('LOGGER_PATH', z.string().min(3)),
            }),
        });

        const tree = walkSchema(schema);

        try {
            schema.parse({ logger: { path: 'x' } });
            throw new Error('Expected parse to fail');
        } catch (err) {
            expect(err).toBeInstanceOf(ZodError);
            const formatted = formatError(err as ZodError, tree);
            expect(formatted.message).toContain('logger.path');
            expect(formatted.message).toContain('env: LOGGER_PATH');
        }
    });

    it('includes inferred env name for auto bindings', () => {
        const schema = z.object({
            db: z.object({
                url: autoEnv(z.string().min(5)),
            }),
        });

        const tree = walkSchema(schema);

        try {
            schema.parse({ db: { url: 'abc' } });
            throw new Error('Expected parse to fail');
        } catch (err) {
            expect(err).toBeInstanceOf(ZodError);
            const formatted = formatError(err as ZodError, tree);
            expect(formatted.message).toContain('db.url');
            expect(formatted.message).toContain('env: DB_URL');
        }
    });
});
