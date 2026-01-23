import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { openBunDb } from '../../db/client';
import { findAuthors, listAuthors } from '../../queries/authorQueries';
import {
    findCommitsBetween,
    findCommitsByAuthorEmail,
    findCommitsByMessage,
    findCommitsByScope,
    findCommitsByType,
    listCommits,
} from '../../queries/commitQueries';
import { findCommitsByPath, listFiles } from '../../queries/fileQueries';
import { listMeta } from '../../queries/metaQueries';
import { findCommitsByPackage } from '../../queries/packageQueries';
import { renderAuthors, renderCommits, renderFiles, renderJson, renderMeta } from '../../utils/dataRenderer';
import { DBPathSchema } from '../schemas';

export const queryCommand = createCommandDefinition({
    name: 'query',
    description: 'Query indexed commits.',
    optionsSchema: z
        .object({
            db: DBPathSchema,
            message: z.string().meta({ description: 'Search commit messages.' }).optional(),
            type: z.string().meta({ description: 'Search by conventional commit type.' }).optional(),
            scope: z.string().meta({ description: 'Search by conventional commit scope.' }).optional(),
            authorSearch: z.string().meta({ description: 'Search authors by name/email.' }).optional(),
            path: z.string().meta({ description: 'Search by path prefix.' }).optional(),
            package: z.string().meta({ description: 'Search by package path.' }).optional(),
            author: z.string().meta({ description: 'Search by author email.' }).optional(),
            between: z.string().meta({ description: 'Two commit hashes separated by "..".' }).optional(),
            listCommits: z.boolean().meta({ description: 'List commits.' }).default(false),
            listFiles: z.boolean().meta({ description: 'List files.' }).default(false),
            listAuthors: z.boolean().meta({ description: 'List authors.' }).default(false),
            listMeta: z.boolean().meta({ description: 'List meta entries.' }).default(false),
            limit: z.number().int().meta({ description: 'Limit results.' }).optional(),
            offset: z.number().int().meta({ description: 'Offset results.' }).optional(),
            json: z.boolean().meta({ description: 'Output raw JSON.' }).default(false),
        })
        .refine(() => true),
    action: async ({ options }) => {
        const db = await openBunDb(options.db);
        try {
            const hasFilters = Boolean(
                options.message ||
                    options.type ||
                    options.scope ||
                    options.authorSearch ||
                    options.path ||
                    options.package ||
                    options.author ||
                    options.between ||
                    options.listCommits ||
                    options.listFiles ||
                    options.listAuthors ||
                    options.listMeta
            );

            if (!hasFilters) {
                const commits = await listCommits(db, { limit: options.limit, offset: options.offset });
                const data = options.json ? renderJson(commits) : renderCommits(commits);
                console.log(data);
                return;
            }

            if (options.message) {
                const commits = await findCommitsByMessage(db, options.message);
                const data = options.json ? renderJson(commits) : renderCommits(commits);
                console.log(data);
                return;
            }

            if (options.type) {
                const commits = await findCommitsByType(db, options.type);
                const data = options.json ? renderJson(commits) : renderCommits(commits);
                console.log(data);
                return;
            }

            if (options.scope) {
                const commits = await findCommitsByScope(db, options.scope);
                const data = options.json ? renderJson(commits) : renderCommits(commits);
                console.log(data);
                return;
            }

            if (options.authorSearch) {
                const authors = await findAuthors(db, options.authorSearch);
                const data = options.json ? renderJson(authors) : renderAuthors(authors);
                console.log(data);
                return;
            }

            if (options.path) {
                const commits = await findCommitsByPath(db, options.path);
                const data = options.json ? renderJson(commits) : renderCommits(commits);
                console.log(data);
                return;
            }

            if (options.package) {
                const commits = await findCommitsByPackage(db, options.package);
                const data = options.json ? renderJson(commits) : renderCommits(commits);
                console.log(data);
                return;
            }

            if (options.author) {
                const commits = await findCommitsByAuthorEmail(db, options.author);
                const data = options.json ? renderJson(commits) : renderCommits(commits);
                console.log(data);
                return;
            }

            if (options.between) {
                const [fromHash, toHash] = options.between.split('..');
                if (!fromHash || !toHash) {
                    throw new Error('between must be in the form <hash>..<hash>');
                }
                const commits = await findCommitsBetween(db, fromHash, toHash);
                const data = options.json ? renderJson(commits) : renderCommits(commits);
                console.log(data);
                return;
            }

            if (options.listCommits) {
                const commits = await listCommits(db, { limit: options.limit, offset: options.offset });
                const data = options.json ? renderJson(commits) : renderCommits(commits);
                console.log(data);
                return;
            }

            if (options.listFiles) {
                const files = await listFiles(db, { limit: options.limit, offset: options.offset });
                const data = options.json ? renderJson(files) : renderFiles(files);
                console.log(data);
                return;
            }

            if (options.listAuthors) {
                const authors = await listAuthors(db, { limit: options.limit, offset: options.offset });
                const data = options.json ? renderJson(authors) : renderAuthors(authors);
                console.log(data);
                return;
            }

            if (options.listMeta) {
                const entries = await listMeta(db);
                const data = options.json ? renderJson(entries) : renderMeta(entries);
                console.log(data);
                return;
            }
        } finally {
            await db.destroy();
        }
    },
});
