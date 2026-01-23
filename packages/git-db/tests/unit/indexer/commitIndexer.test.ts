import { describe, expect, it } from 'bun:test';
import { createBunDb } from '../../../src/db/database-bun';
import { migrate } from '../../../src/db/migrations';
import { indexCommitBatch } from '../../../src/indexer/commitIndexer';

describe('indexCommitBatch', () => {
    it('inserts authors, commits, and files', async () => {
        const db = createBunDb(':memory:');
        try {
            await migrate(db);

            const result = await indexCommitBatch(db, {
                authors: [
                    {
                        id: 'alice@example.com',
                        name: 'Alice',
                        email: 'alice@example.com',
                    },
                ],
                commits: [
                    {
                        hash: 'abc123',
                        author_id: 'alice@example.com',
                        date: '2026-01-01T00:00:00.000Z',
                        message: 'feat: initial commit',
                        body: '',
                        refs: null,
                        type: 'feat',
                        scope: null,
                        is_breaking_change: false,
                    },
                ],
                files: [
                    {
                        hash: 'abc123',
                        path: 'packages/git-db/src/index.ts',
                        status: 'A',
                    },
                ],
            });

            expect(result.authorCount).toBe(1);
            expect(result.commitCount).toBe(1);
            expect(result.fileCount).toBe(1);

            const author = await db.selectFrom('authors').selectAll().executeTakeFirst();
            const commit = await db.selectFrom('commits').selectAll().executeTakeFirst();
            const file = await db.selectFrom('commit_files').selectAll().executeTakeFirst();

            expect(author?.email).toBe('alice@example.com');
            expect(commit?.hash).toBe('abc123');
            expect(file?.path).toBe('packages/git-db/src/index.ts');
        } finally {
            await db.destroy();
        }
    });
});
