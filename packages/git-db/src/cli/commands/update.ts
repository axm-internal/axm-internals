import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { openBunDb } from '../../db/client';
import { scanCommits } from '../../indexer/commitScanner';
import { DBPathSchema } from '../schemas';

export const updateCommand = createCommandDefinition({
    name: 'update',
    description: 'Scan git history and update the index.',
    optionsSchema: z.object({
        db: DBPathSchema,
        includeMerges: z.boolean().meta({ description: 'Include merge commits.' }).default(false),
        limit: z.number().int().meta({ description: 'Max commits to index.' }).optional(),
        skip: z.number().int().meta({ description: 'Skip N commits.' }).optional(),
    }),
    action: async ({ options }) => {
        const db = await openBunDb(options.db);
        try {
            const result = await scanCommits(db, {
                includeMerges: options.includeMerges,
                limit: options.limit,
                skip: options.skip,
            });
            console.log(JSON.stringify(result, null, 2));
        } finally {
            await db.destroy();
        }
    },
});
