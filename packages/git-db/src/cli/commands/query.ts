import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { openBunDb } from '../../db/client';
import { findAuthors, listAuthors } from '../../queries/authorQueries';
import {
    findCommitsBetween,
    findCommitsByAuthorEmail,
    findCommitsByMessage,
    listCommits,
} from '../../queries/commitQueries';
import { findCommitsByPath, listFiles } from '../../queries/fileQueries';
import { findCommitsByPackage } from '../../queries/packageQueries';
import { DBPathSchema } from '../schemas';

export const queryCommand = createCommandDefinition({
    name: 'query',
    description: 'Query indexed commits.',
    optionsSchema: z
        .object({
            db: DBPathSchema,
            message: z.string().meta({ description: 'Search commit messages.' }).optional(),
            authorSearch: z.string().meta({ description: 'Search authors by name/email.' }).optional(),
            path: z.string().meta({ description: 'Search by path prefix.' }).optional(),
            package: z.string().meta({ description: 'Search by package path.' }).optional(),
            author: z.string().meta({ description: 'Search by author email.' }).optional(),
            between: z.string().meta({ description: 'Two commit hashes separated by "..".' }).optional(),
            listCommits: z.boolean().meta({ description: 'List commits.' }).default(false),
            listFiles: z.boolean().meta({ description: 'List files.' }).default(false),
            listAuthors: z.boolean().meta({ description: 'List authors.' }).default(false),
            limit: z.number().int().meta({ description: 'Limit results.' }).optional(),
            offset: z.number().int().meta({ description: 'Offset results.' }).optional(),
        })
        .refine(
            (value) =>
                Boolean(
                    value.message ||
                        value.authorSearch ||
                        value.path ||
                        value.package ||
                        value.author ||
                        value.between ||
                        value.listCommits ||
                        value.listFiles ||
                        value.listAuthors
                ),
            { message: 'Provide at least one query option.' }
        ),
    action: async ({ options }) => {
        const db = await openBunDb(options.db);
        try {
            if (options.message) {
                const commits = await findCommitsByMessage(db, options.message);
                console.log(JSON.stringify(commits, null, 2));
                return;
            }

            if (options.authorSearch) {
                const authors = await findAuthors(db, options.authorSearch);
                console.log(JSON.stringify(authors, null, 2));
                return;
            }

            if (options.path) {
                const commits = await findCommitsByPath(db, options.path);
                console.log(JSON.stringify(commits, null, 2));
                return;
            }

            if (options.package) {
                const commits = await findCommitsByPackage(db, options.package);
                console.log(JSON.stringify(commits, null, 2));
                return;
            }

            if (options.author) {
                const commits = await findCommitsByAuthorEmail(db, options.author);
                console.log(JSON.stringify(commits, null, 2));
                return;
            }

            if (options.between) {
                const [fromHash, toHash] = options.between.split('..');
                if (!fromHash || !toHash) {
                    throw new Error('between must be in the form <hash>..<hash>');
                }
                const commits = await findCommitsBetween(db, fromHash, toHash);
                console.log(JSON.stringify(commits, null, 2));
                return;
            }

            if (options.listCommits) {
                const commits = await listCommits(db, { limit: options.limit, offset: options.offset });
                console.log(JSON.stringify(commits, null, 2));
                return;
            }

            if (options.listFiles) {
                const files = await listFiles(db, { limit: options.limit, offset: options.offset });
                console.log(JSON.stringify(files, null, 2));
                return;
            }

            if (options.listAuthors) {
                const authors = await listAuthors(db, { limit: options.limit, offset: options.offset });
                console.log(JSON.stringify(authors, null, 2));
                return;
            }
        } finally {
            await db.destroy();
        }
    },
});
