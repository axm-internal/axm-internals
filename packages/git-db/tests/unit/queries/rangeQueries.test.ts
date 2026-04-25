import { describe, expect, it, mock } from 'bun:test';
import { createBunDb } from '../../../src/db/database-bun';
import { migrate } from '../../../src/db/migrations';
import { indexCommitBatch } from '../../../src/indexer/commitIndexer';

mock.module('../../../src/git/ranges', () => ({
    listHashesBetween: mock(async (from: string, to: string) => {
        const ranges: Record<string, string[]> = {
            'aaa..ccc': ['aaa', 'bbb', 'ccc'],
            'aaa..bbb': ['aaa', 'bbb'],
            'zzz..yyy': [],
        };
        return ranges[`${from}..${to}`] ?? [];
    }),
    listHashesAfter: mock(async (from: string, to: string) => {
        const ranges: Record<string, string[]> = {
            'aaa..ccc': ['bbb', 'ccc'],
            'aaa..bbb': ['bbb'],
        };
        return ranges[`${from}..${to}`] ?? [];
    }),
}));

const {
    findCommitsBetweenHashes,
    findCommitsAfterHash,
    findCommitsBetweenHashesAll,
    findCommitsBetweenHashesUnscoped,
    findCommitsByScopeAndPath,
} = await import('../../../src/queries/rangeQueries');

const seedDb = async () => {
    const db = createBunDb(':memory:');
    await migrate(db);
    await indexCommitBatch(db, {
        authors: [{ id: 'a@b.com', name: 'A', email: 'a@b.com' }],
        commits: [
            {
                hash: 'aaa',
                author_id: 'a@b.com',
                date: '2026-01-01T00:00:00.000Z',
                message: 'feat(cli-kit): first',
                body: '',
                refs: null,
                type: 'feat',
                scope: 'cli-kit',
                is_breaking_change: false,
            },
            {
                hash: 'bbb',
                author_id: 'a@b.com',
                date: '2026-01-02T00:00:00.000Z',
                message: 'fix(cli-kit): second',
                body: '',
                refs: null,
                type: 'fix',
                scope: 'cli-kit',
                is_breaking_change: false,
            },
            {
                hash: 'ccc',
                author_id: 'a@b.com',
                date: '2026-01-03T00:00:00.000Z',
                message: 'chore: third',
                body: '',
                refs: null,
                type: 'chore',
                scope: null,
                is_breaking_change: false,
            },
        ],
        files: [
            { hash: 'aaa', path: 'packages/cli-kit/src/index.ts', status: 'A' },
            { hash: 'bbb', path: 'packages/cli-kit/src/utils.ts', status: 'M' },
            { hash: 'ccc', path: 'README.md', status: 'M' },
        ],
    });
    return db;
};

describe('rangeQueries', () => {
    it('finds commits between hashes for a scope', async () => {
        const db = await seedDb();
        try {
            const commits = await findCommitsBetweenHashes(db, 'cli-kit', 'aaa', 'ccc');
            expect(commits.map((c) => c.hash)).toEqual(['aaa', 'bbb']);
        } finally {
            await db.destroy();
        }
    });

    it('finds commits after a hash for a scope', async () => {
        const db = await seedDb();
        try {
            const commits = await findCommitsAfterHash(db, 'cli-kit', 'aaa', 'ccc');
            expect(commits.map((c) => c.hash)).toEqual(['bbb']);
        } finally {
            await db.destroy();
        }
    });

    it('finds all commits between hashes', async () => {
        const db = await seedDb();
        try {
            const commits = await findCommitsBetweenHashesAll(db, 'aaa', 'ccc');
            expect(commits.map((c) => c.hash)).toEqual(['aaa', 'bbb', 'ccc']);
        } finally {
            await db.destroy();
        }
    });

    it('finds unscoped commits between hashes', async () => {
        const db = await seedDb();
        try {
            const commits = await findCommitsBetweenHashesUnscoped(db, 'aaa', 'ccc');
            expect(commits.map((c) => c.hash)).toEqual(['ccc']);
        } finally {
            await db.destroy();
        }
    });

    it('finds commits by scope and path', async () => {
        const db = await seedDb();
        try {
            const commits = await findCommitsByScopeAndPath(db, 'cli-kit', 'packages/cli-kit/', 'aaa', 'ccc');
            const hashes = commits.map((c) => c.hash);
            expect(hashes).toContain('aaa');
            expect(hashes).toContain('bbb');
        } finally {
            await db.destroy();
        }
    });

    it('returns empty for empty range', async () => {
        const db = await seedDb();
        try {
            const commits = await findCommitsBetweenHashes(db, 'cli-kit', 'zzz', 'yyy');
            expect(commits).toEqual([]);
        } finally {
            await db.destroy();
        }
    });
});
