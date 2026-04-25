import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { Commit } from '@axm-internal/git-db';

let commitStore: Commit[] = [];
let hashStore: string[] = [];

const buildCommit = (overrides: Partial<Commit>): Commit => ({
    hash: overrides.hash ?? 'hash',
    author_id: overrides.author_id ?? 'author',
    date: overrides.date ?? '2026-01-01T00:00:00.000Z',
    message: overrides.message ?? 'feat: init',
    body: overrides.body ?? '',
    refs: overrides.refs ?? null,
    type: overrides.type ?? null,
    scope: overrides.scope ?? null,
    is_breaking_change: overrides.is_breaking_change ?? null,
});

const createMockDb = (commits: Commit[]) => {
    return {
        selectFrom: (_table: string) => {
            let scopeFilter: string | null = null;
            let hashFilter: string | null = null;
            let hashList: string[] | null = null;
            let scopeIsNull = false;
            let orderByColumn: string | null = null;
            let orderByDirection: 'asc' | 'desc' | null = null;

            const builder = {
                selectAll: () => builder,
                select: (_columns: string[]) => builder,
                innerJoin: () => builder,
                distinct: () => builder,
                orderBy: (column: string, direction?: 'asc' | 'desc') => {
                    orderByColumn = column;
                    orderByDirection = direction ?? null;
                    return builder;
                },
                where: (column: string, op: string, value: string | string[] | null) => {
                    if (column === 'scope' && op === '=') {
                        scopeFilter = value as string;
                    }
                    if (column === 'scope' && op === 'is' && value === null) {
                        scopeIsNull = true;
                    }
                    if (column === 'hash' && op === '=') {
                        hashFilter = value as string;
                    }
                    if (column === 'hash' && op === 'in') {
                        hashList = value as string[];
                    }
                    return builder;
                },
                execute: async () => {
                    const filtered = commits.filter((commit) => {
                        if (scopeFilter && commit.scope !== scopeFilter) return false;
                        if (scopeIsNull && commit.scope !== null) return false;
                        if (hashFilter && commit.hash !== hashFilter) return false;
                        if (hashList && !hashList.includes(commit.hash)) return false;
                        return true;
                    });
                    if (orderByColumn === 'date') {
                        const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));
                        return orderByDirection === 'desc' ? sorted.reverse() : sorted;
                    }
                    return filtered;
                },
                executeTakeFirst: async () => {
                    const rows = await builder.execute();
                    return rows[0] ?? null;
                },
            };

            return builder;
        },
        destroy: async () => {},
    };
};

mock.module('@axm-internal/git-db', () => ({
    openBunDb: async () => createMockDb(commitStore),
    findCommitByHash: async (_db: unknown, hash: string) => commitStore.find((commit) => commit.hash === hash) ?? null,
    findCommitsByScope: async (_db: unknown, scope: string) => commitStore.filter((commit) => commit.scope === scope),
    listCommits: async () => commitStore,
    scanCommits: async () => ({
        lastIndexedHash: null,
        lastIndexedDate: null,
        indexedCount: 0,
    }),
    findCommitsByTagPrefix: async (_db: unknown, tagPrefix: string) =>
        commitStore.filter((commit) => commit.refs?.includes(tagPrefix) ?? false),
    findHeadCommit: async (_db: unknown) => {
        if (hashStore.length === 0) return null;
        return commitStore.find((commit) => commit.hash === hashStore[0]) ?? null;
    },
    findCommitByTag: async (_db: unknown, _tag: string) => {
        const tagHash = hashStore.find((h) => h.startsWith('tag:'));
        if (!tagHash) return null;
        return commitStore.find((commit) => commit.hash === tagHash.replace('tag:', '')) ?? null;
    },
    findCommitsBetweenHashes: async (_db: unknown, scope: string, _fromHash: string, _toHash: string) => {
        const hashes = hashStore.filter((h) => !h.startsWith('range:') && !h.startsWith('tag:') && !h.startsWith('@'));
        if (hashes.length === 0) return [];
        return commitStore.filter((commit) => commit.scope === scope && hashes.includes(commit.hash));
    },
    findCommitsAfterHash: async (_db: unknown, scope: string, _fromHash: string, _toHash: string) => {
        const hashes = hashStore.filter((h) => !h.startsWith('range:') && !h.startsWith('tag:') && !h.startsWith('@'));
        if (hashes.length === 0) return [];
        return commitStore.filter((commit) => commit.scope === scope && hashes.includes(commit.hash));
    },
    findCommitsBetweenHashesAll: async (_db: unknown, _fromHash: string, _toHash: string) => {
        const hashes = hashStore.filter((h) => !h.startsWith('range:') && !h.startsWith('tag:') && !h.startsWith('@'));
        if (hashes.length === 0) return [];
        return commitStore.filter((commit) => hashes.includes(commit.hash));
    },
    findCommitsBetweenHashesUnscoped: async (_db: unknown, _fromHash: string, _toHash: string) => {
        const hashes = hashStore.filter((h) => !h.startsWith('range:') && !h.startsWith('tag:') && !h.startsWith('@'));
        if (hashes.length === 0) return [];
        return commitStore.filter((commit) => commit.scope === null && hashes.includes(commit.hash));
    },
    findCommitsByScopeAndPath: async (
        _db: unknown,
        scope: string,
        _pathPrefix: string,
        _fromHash: string,
        _toHash: string
    ) => {
        const hashes = hashStore.filter((h) => !h.startsWith('range:') && !h.startsWith('tag:') && !h.startsWith('@'));
        if (hashes.length === 0) return [];
        return commitStore.filter(
            (commit) => (commit.scope === scope || commit.scope === null) && hashes.includes(commit.hash)
        );
    },
    listReleaseTags: async () => hashStore.filter((h) => h.startsWith('@axm-internal')),
    listReleaseTagsForScope: async (_scope: string, _sort?: string) =>
        hashStore.filter((h) => h.startsWith('@axm-internal')),
    getLatestReleaseTagForScope: async (scope: string) => {
        const tags = hashStore.filter((h) => h.startsWith(`@axm-internal/${scope}@`));
        return tags[0] ?? null;
    },
}));

const { GitQuery } = await import('../../../src/services/GitQuery');

describe('GitQuery', () => {
    beforeEach(() => {
        hashStore = [];
        commitStore = [];
    });

    it('returns null when no commits exist for a scope', async () => {
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const result = await service.getFirstCommit('cli-kit');
        expect(result).toBeNull();
    });

    it('returns the earliest commit by date for a scope', async () => {
        commitStore = [
            buildCommit({ hash: 'b', date: '2026-01-02T00:00:00.000Z', scope: 'cli-kit' }),
            buildCommit({ hash: 'a', date: '2026-01-01T00:00:00.000Z', scope: 'cli-kit' }),
        ];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const result = await service.getFirstCommit('cli-kit');
        expect(result?.hash).toBe('a');
    });

    it('filters tagged commits for a scope', async () => {
        commitStore = [
            buildCommit({ hash: 'tagged', refs: '@axm-internal/cli-kit@0.1.0', scope: 'cli-kit' }),
            buildCommit({ hash: 'other', refs: '@axm-internal/other@0.1.0', scope: 'other' }),
        ];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const result = await service.getTags('cli-kit');
        expect(result.map((commit) => commit.hash)).toEqual(['tagged']);
    });

    it('returns latest commit for a scope', async () => {
        commitStore = [
            buildCommit({ hash: 'older', date: '2026-01-01T00:00:00.000Z', scope: 'cli-kit' }),
            buildCommit({ hash: 'latest', date: '2026-01-02T00:00:00.000Z', scope: 'cli-kit' }),
        ];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const result = await service.getLatestCommit('cli-kit');
        expect(result?.hash).toBe('latest');
    });

    it('lists release tags', async () => {
        hashStore = ['@axm-internal/cli-kit@0.1.0'];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const result = await service.listReleaseTags();
        expect(result).toEqual(['@axm-internal/cli-kit@0.1.0']);
    });

    it('lists release tags for a scope and returns latest', async () => {
        hashStore = ['@axm-internal/cli-kit@0.2.0', '@axm-internal/cli-kit@0.1.0'];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const tags = await service.listReleaseTagsForScope('cli-kit');
        const latest = await service.getLatestTagForScope('cli-kit');
        expect(tags).toEqual(['@axm-internal/cli-kit@0.2.0', '@axm-internal/cli-kit@0.1.0']);
        expect(latest).toBe('@axm-internal/cli-kit@0.2.0');
    });

    it('fetches commits by hash', async () => {
        commitStore = [buildCommit({ hash: 'abc', scope: 'cli-kit' })];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commit = await service.getCommitByHash('abc');
        expect(commit?.hash).toBe('abc');
    });

    it('fetches head commit', async () => {
        commitStore = [buildCommit({ hash: 'abc', scope: 'cli-kit' })];
        hashStore = ['abc'];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const head = await service.getHeadCommit();
        expect(head?.hash).toBe('abc');
    });

    it('fetches commit for tag', async () => {
        commitStore = [buildCommit({ hash: 'taghash', scope: 'cli-kit' })];
        hashStore = ['tag:taghash'];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commit = await service.getCommitForTag('@axm-internal/cli-kit@0.1.0');
        expect(commit?.hash).toBe('taghash');
    });

    it('returns commits between two commits in hash order', async () => {
        commitStore = [
            buildCommit({ hash: 'c1', scope: 'cli-kit' }),
            buildCommit({ hash: 'c2', scope: 'cli-kit' }),
            buildCommit({ hash: 'other', scope: 'other' }),
        ];
        hashStore = ['c1', 'c2'];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commits = await service.getCommitsBetweenHashes('cli-kit', 'c1', 'c2');
        expect(commits.map((commit) => commit.hash)).toEqual(['c1', 'c2']);
    });

    it('returns commits after a hash for a scope', async () => {
        commitStore = [
            buildCommit({ hash: 'c1', scope: 'cli-kit' }),
            buildCommit({ hash: 'c2', scope: 'cli-kit' }),
            buildCommit({ hash: 'other', scope: 'other' }),
        ];
        hashStore = ['c2'];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commits = await service.getCommitsAfterHash('cli-kit', 'c1', 'c2');
        expect(commits.map((commit) => commit.hash)).toEqual(['c2']);
    });

    it('returns commits for a package by scope or path', async () => {
        commitStore = [buildCommit({ hash: 'c1', scope: 'cli-kit' }), buildCommit({ hash: 'c2', scope: 'cli-kit' })];
        hashStore = ['c1', 'c2'];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commits = await service.getCommitsBetweenHashesForPackage('cli-kit', 'packages/cli-kit/', 'c1', 'c2');
        expect(commits.map((commit) => commit.hash)).toEqual(['c1', 'c2']);
    });

    it('returns unscoped commits between two hashes', async () => {
        commitStore = [
            buildCommit({ hash: 'c1', scope: 'cli-kit' }),
            buildCommit({ hash: 'c2', scope: null }),
            buildCommit({ hash: 'other', scope: 'other' }),
        ];
        hashStore = ['c1', 'c2', 'other'];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commits = await service.getCommitsBetweenHashesUnscoped('c1', 'c2');
        expect(commits.map((commit) => commit.hash)).toEqual(['c2']);
    });

    it('returns commits between two commits using commit objects', async () => {
        commitStore = [buildCommit({ hash: 'c1', scope: 'cli-kit' }), buildCommit({ hash: 'c2', scope: 'cli-kit' })];
        hashStore = ['c1', 'c2'];
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commits = await service.getCommitBetween('cli-kit', commitStore[0], commitStore[1]);
        expect(commits.map((commit) => commit.hash)).toEqual(['c1', 'c2']);
    });
});
