import { ZodError, type ZodObject, type z } from 'zod';
import { buildRawConfig } from './internal/buildRawConfig';
import { formatError } from './internal/formatError';
import { loadEnv } from './internal/loadEnv';
import type { BootOptions } from './internal/types';
import { walkSchema } from './internal/walkSchema';

export function defineConfig<T extends ZodObject>(schema: T, options?: BootOptions): z.infer<T> {
    if (options?.envDir) {
        loadEnv(options.envDir);
    }

    const tree = walkSchema(schema);
    const raw = buildRawConfig(tree);

    try {
        return schema.parse(raw);
    } catch (err) {
        if (err instanceof ZodError) {
            throw formatError(err, tree);
        }
        throw err;
    }
}
