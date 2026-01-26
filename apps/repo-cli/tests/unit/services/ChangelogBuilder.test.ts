import { describe, expect, it } from 'bun:test';
import type { Commit } from '@axm-internal/git-db';
import type { RootChangelog, ScopeChangelog } from '../../../src/schemas/ChangelogJsonSchema';
import type { PackageApp } from '../../../src/schemas/PackageAppSchema';
import { ChangelogBuilder } from '../../../src/services/ChangelogBuilder';
import type { ChangelogStore } from '../../../src/services/ChangelogStore';
import type { PackageInfoService } from '../../../src/services/PackageInfoService';

class MemoryStore {
    protected scopes = new Map<string, ScopeChangelog>();
    protected root: RootChangelog = { entries: [] };

    async ensureDir(): Promise<void> {
        return;
    }

    async readScope(scope: string): Promise<ScopeChangelog> {
        return this.scopes.get(scope) ?? { scope, entries: [] };
    }

    async writeScope(data: ScopeChangelog) {
        this.scopes.set(data.scope, data);
    }

    async readRoot(): Promise<RootChangelog> {
        return this.root;
    }

    async writeRoot(data: RootChangelog) {
        this.root = data;
    }
}

class FakePackageInfo {
    protected commitList: Commit[];
    protected tag: string | null;

    constructor(commits: Commit[], tag: string | null) {
        this.commitList = commits;
        this.tag = tag;
    }

    async closeDb() {
        return;
    }

    async indexDb(): Promise<void> {
        return;
    }

    async refs() {
        return { first: this.commitList[0] ?? null, tags: null, latestTagName: this.tag };
    }

    async latest() {
        return this.commitList[this.commitList.length - 1] ?? null;
    }

    async commitForTag() {
        return this.commitList[this.commitList.length - 1] ?? null;
    }

    async commits() {
        return this.commitList;
    }

    async releases() {
        return [];
    }

    async releaseTags() {
        return this.tag ? [this.tag] : [];
    }
}

const buildCommit = (hash: string, message: string): Commit => ({
    hash,
    author_id: 'author-1',
    date: '2026-01-01T00:00:00Z',
    message,
    body: '',
    refs: null,
    type: 'feat',
    scope: 'cli-kit',
    is_breaking_change: false,
});

describe('ChangelogBuilder', () => {
    it('reports and backfills entries', async () => {
        const commits = [buildCommit('a1', 'feat(cli-kit): init')];
        const info = new FakePackageInfo(commits, '@axm-internal/cli-kit@0.1.0');
        const store = new MemoryStore();
        const builder = new ChangelogBuilder(info as unknown as PackageInfoService, store as unknown as ChangelogStore);
        const targets = ['packages/cli-kit'] as PackageApp[];

        const report = await builder.report(targets);
        expect(report.needsBackfill).toBe(1);

        const applied = await builder.backfill(targets);
        expect(applied.needsBackfill).toBe(1);

        const scopeData = await store.readScope('cli-kit');
        expect(scopeData.entries).toHaveLength(1);
    });
});
