import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { openBunDb } from '../../db/client';
import { DBPathSchema } from '../schemas';

export const initCommand = createCommandDefinition({
    name: 'init',
    description: 'Create the git-db SQLite schema.',
    optionsSchema: z.object({
        db: DBPathSchema,
    }),
    action: async ({ options }) => {
        const db = await openBunDb(options.db);
        await db.destroy();
        console.log(`Initialized git-db at ${options.db}`);
    },
});
