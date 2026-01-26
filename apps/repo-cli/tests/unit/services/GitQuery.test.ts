import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { Commit } from '@axm-internal/git-db';

const execaResponses = new Map<string, string>();
let commitStore: Commit[] = [];

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
            let pathPrefix: string | null = null;
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
                    if (column === 'commit_files.path' && op === 'like') {
                        pathPrefix = (value as string).replace(/%$/, '');
                    }
                    return builder;
                },
                execute: async () => {
                    const filtered = commits.filter((commit) => {
                        if (scopeFilter && commit.scope !== scopeFilter) return false;
                        if (scopeIsNull && commit.scope !== null) return false;
                        if (hashFilter && commit.hash !== hashFilter) return false;
                        if (hashList && !hashList.includes(commit.hash)) return false;
                        if (pathPrefix) {
                            const path = commit.message;
                            if (!path.startsWith(pathPrefix)) return false;
                        }
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

mock.module('execa', () => ({
    execa: (_cmd: string, args: string[]) => {
        const key = args.join(' ');
        const stdout = execaResponses.get(key) ?? '';
        return Promise.resolve({ stdout, stderr: '', exitCode: 0 });
    },
}));

mock.module('@axm-internal/git-db', () => ({
    openBunDb: async () => createMockDb(commitStore),
    findCommitsByScope: async (_db: unknown, scope: string) => commitStore.filter((commit) => commit.scope === scope),
    listCommits: async () => commitStore,
    scanCommits: async () => ({
        insertedCommits: 0,
        insertedFiles: 0,
        insertedAuthors: 0,
        lastIndexedHash: null,
        lastIndexedDate: null,
    }),
}));

const { GitQuery } = await import('../../../src/services/GitQuery');

describe('GitQuery', () => {
    beforeEach(() => {
        execaResponses.clear();
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
        execaResponses.set('tag --list @axm-internal/*@*', '@axm-internal/cli-kit@0.1.0\n\n');
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const result = await service.listReleaseTags();
        expect(result).toEqual(['@axm-internal/cli-kit@0.1.0']);
    });

    it('lists release tags for a scope and returns latest', async () => {
        execaResponses.set(
            'tag --list @axm-internal/cli-kit@* --sort=-v:refname',
            '@axm-internal/cli-kit@0.2.0\n@axm-internal/cli-kit@0.1.0'
        );
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const tags = await service.listReleaseTagsForScope('cli-kit');
        const latest = await service.getLatestTagForScope('cli-kit');
        expect(tags).toEqual(['@axm-internal/cli-kit@0.2.0', '@axm-internal/cli-kit@0.1.0']);
        expect(latest).toBe('@axm-internal/cli-kit@0.2.0');
    });

    it('fetches commits by hash and head', async () => {
        commitStore = [buildCommit({ hash: 'abc', scope: 'cli-kit' })];
        execaResponses.set('rev-parse HEAD', 'abc');
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commit = await service.getCommitByHash('abc');
        const head = await service.getHeadCommit();
        expect(commit?.hash).toBe('abc');
        expect(head?.hash).toBe('abc');
    });

    it('fetches commit for tag', async () => {
        commitStore = [buildCommit({ hash: 'taghash', scope: 'cli-kit' })];
        execaResponses.set('rev-list -n 1 @axm-internal/cli-kit@0.1.0', 'taghash');
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
        execaResponses.set('rev-list --reverse c1^..c2', 'c1\nc2\nother');
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commits = await service.getCommitsBetweenHashes('cli-kit', 'c1', 'c2');
        expect(commits.map((commit) => commit.hash)).toEqual(['c1', 'c2']);
    });

    it('returns commits for a package by scope or path', async () => {
        commitStore = [
            buildCommit({ hash: 'c1', scope: 'repo-cli', message: 'packages/cli-kit/src/index.ts' }),
            buildCommit({ hash: 'c2', scope: 'cli-kit' }),
            buildCommit({ hash: 'c3', scope: null }),
        ];
        execaResponses.set('rev-list --reverse c1^..c2', 'c1\nc2\nc3');
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
        execaResponses.set('rev-list --reverse c1^..c2', 'c1\nc2\nother');
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commits = await service.getCommitsBetweenHashesUnscoped('c1', 'c2');
        expect(commits.map((commit) => commit.hash)).toEqual(['c2']);
    });

    it('returns commits between two commits using commit objects', async () => {
        commitStore = [buildCommit({ hash: 'c1', scope: 'cli-kit' }), buildCommit({ hash: 'c2', scope: 'cli-kit' })];
        execaResponses.set('rev-list --reverse c1^..c2', 'c1\nc2');
        const service = new GitQuery({ dbPath: '/tmp/git-db.sqlite' });
        const commits = await service.getCommitBetween('cli-kit', commitStore[0], commitStore[1]);
        expect(commits.map((commit) => commit.hash)).toEqual(['c1', 'c2']);
    });
});
