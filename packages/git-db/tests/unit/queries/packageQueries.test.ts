import { describe, expect, it } from 'bun:test';
import { createBunDb } from '../../../src/db/database-bun';
import { migrate } from '../../../src/db/migrations';
import { indexCommitBatch } from '../../../src/indexer/commitIndexer';
import { findCommitsByPackage } from '../../../src/queries/packageQueries';

describe('package queries', () => {
    it('finds commits by package path', async () => {
        const db = createBunDb(':memory:');
        try {
            await migrate(db);

            await indexCommitBatch(db, {
                authors: [{ id: 'alice@example.com', name: 'Alice', email: 'alice@example.com' }],
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
                        author_id: 'alice@example.com',
                        date: '2026-01-02T00:00:00.000Z',
                        message: 'fix: second',
                        body: '',
                        refs: null,
                        type: 'fix',
                        scope: null,
                        is_breaking_change: false,
                    },
                ],
                files: [
                    { hash: 'a1', path: 'packages/git-db/src/index.ts', status: 'A' },
                    { hash: 'b2', path: 'packages/cli-kit/src/index.ts', status: 'M' },
                ],
            });

            const commits = await findCommitsByPackage(db, 'packages/git-db');
            expect(commits.length).toBe(1);
            expect(commits[0]?.hash).toBe('a1');
        } finally {
            await db.destroy();
        }
    });
});
