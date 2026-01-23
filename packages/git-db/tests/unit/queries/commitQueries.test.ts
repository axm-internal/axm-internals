import { describe, expect, it } from 'bun:test';
import { createBunDb } from '../../../src/db/database-bun';
import { migrate } from '../../../src/db/migrations';
import { indexCommitBatch } from '../../../src/indexer/commitIndexer';
import { findAuthors, listAuthors } from '../../../src/queries/authorQueries';
import {
    findCommitsBetween,
    findCommitsByAuthorEmail,
    findCommitsByMessage,
    findCommitsByScope,
    findCommitsByType,
    listCommits,
} from '../../../src/queries/commitQueries';

describe('commit queries', () => {
    it('finds commits by message, range, and author', async () => {
        const db = createBunDb(':memory:');
        try {
            await migrate(db);

            await indexCommitBatch(db, {
                authors: [
                    { id: 'alice@example.com', name: 'Alice', email: 'alice@example.com' },
                    { id: 'bob@example.com', name: 'Bob', email: 'bob@example.com' },
                ],
                commits: [
                    {
                        hash: 'a1',
                        author_id: 'alice@example.com',
                        date: '2026-01-01T00:00:00.000Z',
                        message: 'feat: first',
                        body: '',
                        refs: null,
                        type: 'feat',
                        scope: null,
                        is_breaking_change: false,
                    },
                    {
                        hash: 'b2',
                        author_id: 'bob@example.com',
                        date: '2026-01-02T00:00:00.000Z',
                        message: 'fix(core): second',
                        body: '',
                        refs: null,
                        type: 'fix',
                        scope: 'core',
                        is_breaking_change: false,
                    },
                    {
                        hash: 'c3',
                        author_id: 'alice@example.com',
                        date: '2026-01-03T00:00:00.000Z',
                        message: 'chore: third',
                        body: '',
                        refs: null,
                        type: 'chore',
                        scope: null,
                        is_breaking_change: false,
                    },
                    {
                        hash: 'd4',
                        author_id: 'alice@example.com',
                        date: '2026-01-04T00:00:00.000Z',
                        message: 'feat: 100% coverage',
                        body: '',
                        refs: null,
                        type: 'feat',
                        scope: null,
                        is_breaking_change: false,
                    },
                ],
                files: [
                    { hash: 'a1', path: 'packages/git-db/src/index.ts', status: 'A' },
                    { hash: 'b2', path: 'packages/git-db/src/db/client.ts', status: 'M' },
                    { hash: 'c3', path: 'packages/git-db/src/db/schema.ts', status: 'M' },
                    { hash: 'd4', path: 'packages/git-db/src/db/schema.ts', status: 'M' },
                ],
            });

            const byMessage = await findCommitsByMessage(db, 'fix');
            expect(byMessage.length).toBe(1);
            expect(byMessage[0]?.hash).toBe('b2');

            const byAuthor = await findCommitsByAuthorEmail(db, 'alice@example.com');
            expect(byAuthor.length).toBe(3);

            const byType = await findCommitsByType(db, 'fix');
            expect(byType.length).toBe(1);
            expect(byType[0]?.hash).toBe('b2');

            const byScope = await findCommitsByScope(db, 'core');
            expect(byScope.length).toBe(1);
            expect(byScope[0]?.hash).toBe('b2');

            const byLiteralPercent = await findCommitsByMessage(db, '100%');
            expect(byLiteralPercent.length).toBe(1);
            expect(byLiteralPercent[0]?.hash).toBe('d4');

            const between = await findCommitsBetween(db, 'a1', 'b2');
            expect(between.length).toBe(2);

            const authors = await findAuthors(db, 'alice');
            expect(authors.length).toBe(1);
            expect(authors[0]?.email).toBe('alice@example.com');

            const listedCommits = await listCommits(db, { limit: 2 });
            expect(listedCommits.length).toBe(2);

            const listedAuthors = await listAuthors(db, { limit: 1 });
            expect(listedAuthors.length).toBe(1);
        } finally {
            await db.destroy();
        }
    });
});
