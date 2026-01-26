import { describe, expect, it } from 'bun:test';
import type { Commit } from '@axm-internal/git-db';
import { ChangeSetBuilder } from '../../../src/services/ChangeSetBuilder';
import type { PackageInfoService } from '../../../src/services/PackageInfoService';

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

const createPackageInfo = (overrides: Partial<PackageInfoService>) => overrides as PackageInfoService;

describe('ChangeSetBuilder', () => {
    it('creates a draft for a package path', async () => {
        const commits = [buildCommit({ hash: 'a', type: 'feat', scope: 'cli-kit' })];
        let capturedScope: string | null = null;
        const creator = new ChangeSetBuilder(
            createPackageInfo({
                refs: async () => ({ first: commits[0] ?? null, tags: [], latestTagName: null }),
                latest: async () => commits[0] ?? null,
                commitForTag: async () => null,
                commits: async (scope: string) => {
                    capturedScope = scope;
                    return commits;
                },
                commitsAfter: async () => commits,
            })
        );

        const draft = await creator.createForPackagePath('packages/cli-kit');
        expect(draft.scope).toBe('cli-kit');
        expect(draft.packagePath).toBe('packages/cli-kit');
        expect(draft.suggestedBump).toBe('minor');
        expect(draft.summaryLines).toEqual(['feat: init']);
        expect(capturedScope ?? 'missing').toBe('cli-kit');
    });

    it('uses latest tag commit as the range start when available', async () => {
        const first = buildCommit({ hash: 'first', type: 'fix', scope: 'cli-kit' });
        const tagCommit = buildCommit({ hash: 'tag', scope: 'cli-kit' });
        const latest = buildCommit({ hash: 'latest', type: 'fix', scope: 'cli-kit' });
        const creator = new ChangeSetBuilder(
            createPackageInfo({
                refs: async () => ({ first: first ?? null, tags: [], latestTagName: '@axm-internal/cli-kit@0.1.0' }),
                latest: async () => latest ?? null,
                commitForTag: async () => tagCommit,
                commits: async () => [tagCommit, latest],
                commitsAfter: async () => [latest],
            })
        );

        const draft = await creator.createForScope('cli-kit');
        expect(draft.fromCommit?.hash).toBe('tag');
        expect(draft.toCommit?.hash).toBe('latest');
        expect(draft.suggestedBump).toBe('patch');
    });

    it('returns null bump when no conventional types exist', async () => {
        const commits = [buildCommit({ hash: 'a', type: null, scope: 'cli-kit' })];
        const creator = new ChangeSetBuilder(
            createPackageInfo({
                refs: async () => ({ first: commits[0] ?? null, tags: [], latestTagName: null }),
                latest: async () => commits[0] ?? null,
                commitForTag: async () => null,
                commits: async () => commits,
                commitsAfter: async () => commits,
            })
        );

        const draft = await creator.createForScope('cli-kit');
        expect(draft.suggestedBump).toBeNull();
    });

    it('returns major bump when breaking changes exist', async () => {
        const commits = [buildCommit({ hash: 'a', is_breaking_change: true, scope: 'cli-kit' })];
        const creator = new ChangeSetBuilder(
            createPackageInfo({
                refs: async () => ({ first: commits[0] ?? null, tags: [], latestTagName: null }),
                latest: async () => commits[0] ?? null,
                commitForTag: async () => null,
                commits: async () => commits,
                commitsAfter: async () => commits,
            })
        );

        const draft = await creator.createForScope('cli-kit');
        expect(draft.suggestedBump).toBe('major');
    });

    it('creates drafts for multiple package paths', async () => {
        const commit = buildCommit({ hash: 'a', type: 'fix', scope: 'cli-kit' });
        const creator = new ChangeSetBuilder(
            createPackageInfo({
                refs: async () => ({ first: commit ?? null, tags: [], latestTagName: null }),
                latest: async () => commit ?? null,
                commitForTag: async () => null,
                commits: async () => [commit],
                commitsAfter: async () => [commit],
            })
        );

        const drafts = await creator.createForPackagePaths(['packages/cli-kit']);
        expect(drafts).toHaveLength(1);
        expect(drafts[0]?.scope).toBe('cli-kit');
    });
});
