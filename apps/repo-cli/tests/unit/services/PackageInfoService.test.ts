import { describe, expect, it } from 'bun:test';
import type { Commit } from '@axm-internal/git-db';
import type { GitQuery } from '../../../src/services/GitQuery';
import { PackageInfoService } from '../../../src/services/PackageInfoService';

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

const createGitQuery = (overrides: Partial<GitQuery>) => overrides as GitQuery;

describe('PackageInfoService', () => {
    it('indexes and closes the database', async () => {
        let indexed = false;
        let closed = false;
        const service = new PackageInfoService(
            createGitQuery({
                updateDb: async () => {
                    indexed = true;
                    return {
                        indexedCount: 0,
                        insertedCommits: 0,
                        insertedFiles: 0,
                        insertedAuthors: 0,
                        lastIndexedHash: null,
                        lastIndexedDate: null,
                    };
                },
                closeDb: async () => {
                    closed = true;
                },
            })
        );

        await service.indexDb();
        expect(indexed).toBe(true);
        expect(closed).toBe(true);
    });

    it('returns refs data for a valid scope', async () => {
        const first = buildCommit({ hash: 'first', scope: 'cli-kit' });
        const tags = [buildCommit({ hash: 'tag', refs: '@axm-internal/cli-kit@0.1.0', scope: 'cli-kit' })];
        const service = new PackageInfoService(
            createGitQuery({
                getFirstCommit: async () => first,
                getTags: async () => tags,
                getLatestTagForScope: async () => '@axm-internal/cli-kit@0.1.0',
            })
        );

        const refs = await service.refs('cli-kit');
        expect(refs.first?.hash).toBe('first');
        expect(refs.tags?.length).toBe(1);
        expect(refs.latestTagName).toBe('@axm-internal/cli-kit@0.1.0');
    });

    it('throws for invalid scope in refs', async () => {
        const service = new PackageInfoService(createGitQuery({}));
        expect(service.refs('nope')).rejects.toThrow('Invalid scope given nope');
    });

    it('returns commits between hashes', async () => {
        const commits = [buildCommit({ hash: 'a', scope: 'cli-kit' }), buildCommit({ hash: 'b', scope: 'cli-kit' })];
        const service = new PackageInfoService(
            createGitQuery({
                getCommitsBetweenHashes: async () => commits,
            })
        );

        const result = await service.commits('cli-kit', 'a', 'b');
        expect(result.map((commit) => commit.hash)).toEqual(['a', 'b']);
    });

    it('returns unscoped commits between hashes', async () => {
        const commits = [buildCommit({ hash: 'a' }), buildCommit({ hash: 'b' })];
        const service = new PackageInfoService(
            createGitQuery({
                getCommitsBetweenHashesAll: async () => commits,
            })
        );

        const result = await service.commitsAll('a', 'b');
        expect(result.map((commit) => commit.hash)).toEqual(['a', 'b']);
    });

    it('returns latest commit for scope', async () => {
        const latest = buildCommit({ hash: 'latest', scope: 'cli-kit' });
        const service = new PackageInfoService(
            createGitQuery({
                getLatestCommit: async () => latest,
            })
        );

        const result = await service.latest('cli-kit');
        expect(result?.hash).toBe('latest');
    });

    it('returns commit for tag', async () => {
        const tagged = buildCommit({ hash: 'taghash', scope: 'cli-kit' });
        const service = new PackageInfoService(
            createGitQuery({
                getCommitForTag: async () => tagged,
            })
        );

        const result = await service.commitForTag('@axm-internal/cli-kit@0.1.0');
        expect(result?.hash).toBe('taghash');
    });

    it('groups releases by scope', async () => {
        const service = new PackageInfoService(
            createGitQuery({
                listReleaseTags: async () => [
                    '@axm-internal/cli-kit@0.2.0',
                    '@axm-internal/cli-kit@0.1.0',
                    '@axm-internal/config-schema@0.1.0',
                ],
            })
        );

        const result = await service.releases();
        expect(result).toEqual([
            { scope: 'cli-kit', tags: ['@axm-internal/cli-kit@0.2.0', '@axm-internal/cli-kit@0.1.0'] },
            { scope: 'config-schema', tags: ['@axm-internal/config-schema@0.1.0'] },
        ]);
    });

    it('filters releases by scope', async () => {
        const service = new PackageInfoService(
            createGitQuery({
                listReleaseTags: async () => ['@axm-internal/cli-kit@0.2.0', '@axm-internal/config-schema@0.1.0'],
            })
        );

        const result = await service.releases('cli-kit');
        expect(result).toEqual([{ scope: 'cli-kit', tags: ['@axm-internal/cli-kit@0.2.0'] }]);
    });

    it('returns release tags for a scope', async () => {
        const service = new PackageInfoService(
            createGitQuery({
                listReleaseTagsForScope: async () => ['@axm-internal/cli-kit@0.2.0', '@axm-internal/cli-kit@0.1.0'],
            })
        );

        const result = await service.releaseTags('cli-kit');
        expect(result).toEqual(['@axm-internal/cli-kit@0.2.0', '@axm-internal/cli-kit@0.1.0']);
    });
});
