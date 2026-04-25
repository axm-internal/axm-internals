import { describe, expect, it, mock } from 'bun:test';
import { createBunDb } from '../../../src/db/database-bun';
import { migrate } from '../../../src/db/migrations';
import { indexCommitBatch } from '../../../src/indexer/commitIndexer';

mock.module('../../../src/git/tags', () => ({
    resolveTag: mock(async (tag: string) => {
        if (tag === '@axm-internal/cli-kit@0.1.0') return 'a1';
        throw Object.assign(new Error(`unknown tag: ${tag}`), { exitCode: 128 });
    }),
    listReleaseTags: mock(async () => ['@axm-internal/cli-kit@0.1.0']),
    listReleaseTagsForScope: mock(async (scope: string) => [`@axm-internal/${scope}@0.1.0`]),
    getLatestReleaseTagForScope: mock(async (scope: string) => `@axm-internal/${scope}@0.1.0`),
    getHeadHash: mock(async () => 'a1'),
    parseTag: mock((tag: string) => {
        const match = tag.match(/^@axm-internal\/([^@]+)@(.+)$/);
        if (!match) return null;
        return { scope: match[1], version: match[2] };
    }),
}));

const { findCommitsByTagPrefix, findCommitByTag, findHeadCommit } = await import('../../../src/queries/tagQueries');
const { parseTag } = await import('../../../src/git/tags');

describe('tagQueries', () => {
    it('finds commits by tag prefix using SQL LIKE', async () => {
        const db = createBunDb(':memory:');
        try {
            await migrate(db);
            await indexCommitBatch(db, {
                authors: [{ id: 'a@b.com', name: 'A', email: 'a@b.com' }],
                commits: [
                    {
                        hash: 'a1',
                        author_id: 'a@b.com',
                        date: '2026-01-01T00:00:00.000Z',
                        message: 'feat: first',
                        body: '',
                        refs: '@axm-internal/cli-kit@0.1.0',
                        type: 'feat',
                        scope: 'cli-kit',
                        is_breaking_change: false,
                    },
                    {
                        hash: 'b2',
                        author_id: 'a@b.com',
                        date: '2026-01-02T00:00:00.000Z',
                        message: 'fix: second',
                        body: '',
                        refs: '@axm-internal/git-db@0.1.0',
                        type: 'fix',
                        scope: 'git-db',
                        is_breaking_change: false,
                    },
                ],
                files: [],
            });

            const result = await findCommitsByTagPrefix(db, '@axm-internal/cli-kit@');
            expect(result.length).toBe(1);
            expect(result[0]?.hash).toBe('a1');
        } finally {
            await db.destroy();
        }
    });

    it('finds commit by tag', async () => {
        const db = createBunDb(':memory:');
        try {
            await migrate(db);
            await indexCommitBatch(db, {
                authors: [{ id: 'a@b.com', name: 'A', email: 'a@b.com' }],
                commits: [
                    {
                        hash: 'a1',
                        author_id: 'a@b.com',
                        date: '2026-01-01T00:00:00.000Z',
                        message: 'feat: first',
                        body: '',
                        refs: '@axm-internal/cli-kit@0.1.0',
                        type: 'feat',
                        scope: 'cli-kit',
                        is_breaking_change: false,
                    },
                ],
                files: [],
            });

            const commit = await findCommitByTag(db, '@axm-internal/cli-kit@0.1.0');
            expect(commit?.hash).toBe('a1');
        } finally {
            await db.destroy();
        }
    });

    it('returns null for unknown tag', async () => {
        const db = createBunDb(':memory:');
        try {
            await migrate(db);
            const commit = await findCommitByTag(db, '@axm-internal/unknown@9.9.9');
            expect(commit).toBeNull();
        } finally {
            await db.destroy();
        }
    });

    it('parses a valid tag into scope and version', () => {
        const result = parseTag('@axm-internal/cli-kit@0.1.0');
        expect(result).toEqual({ scope: 'cli-kit', version: '0.1.0' });
    });

    it('returns null for invalid tag format', () => {
        expect(parseTag('v1.0.0')).toBeNull();
        expect(parseTag('invalid')).toBeNull();
    });

    it('finds head commit', async () => {
        const db = createBunDb(':memory:');
        try {
            await migrate(db);
            await indexCommitBatch(db, {
                authors: [{ id: 'a@b.com', name: 'A', email: 'a@b.com' }],
                commits: [
                    {
                        hash: 'a1',
                        author_id: 'a@b.com',
                        date: '2026-01-01T00:00:00.000Z',
                        message: 'feat: first',
                        body: '',
                        refs: null,
                        type: 'feat',
                        scope: null,
                        is_breaking_change: false,
                    },
                ],
                files: [],
            });

            const commit = await findHeadCommit(db);
            expect(commit?.hash).toBe('a1');
        } finally {
            await db.destroy();
        }
    });
});
