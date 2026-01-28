import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Commit } from '@axm-internal/git-db';
import type { RootChangelog, ScopeChangelog } from '../../../src/schemas/ChangelogJsonSchema';
import type { PackageApp } from '../../../src/schemas/PackageAppSchema';
import { ChangelogBuilder, resolvePackageTargets } from '../../../src/services/ChangelogBuilder';
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
    protected scope: string;
    protected commitsByPackage: Map<string, Commit[]>;
    protected unscopedCommits: Commit[];
    public indexCalls = 0;

    constructor(
        commits: Commit[],
        tag: string | null,
        scope = 'cli-kit',
        commitsByPackage: Map<string, Commit[]> = new Map(),
        unscopedCommits: Commit[] = []
    ) {
        this.commitList = commits;
        this.tag = tag;
        this.scope = scope;
        this.commitsByPackage = commitsByPackage;
        this.unscopedCommits = unscopedCommits;
    }

    async closeDb() {
        return;
    }

    async indexDb(): Promise<void> {
        this.indexCalls += 1;
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

    async commitByHash(hash: string) {
        return this.commitList.find((commit) => commit.hash === hash) ?? null;
    }

    async commits() {
        return this.commitList.filter((commit) => commit.scope === this.scope);
    }

    async commitsForPackage(packagePath: string) {
        return this.commitsByPackage.get(packagePath) ?? [];
    }

    async commitsUnscoped() {
        return this.unscopedCommits;
    }

    async commitsAll() {
        return this.commitList;
    }

    async releases() {
        return [];
    }

    async releaseTags() {
        return this.tag ? [this.tag] : [];
    }
}

const buildCommit = (hash: string, message: string, scope: string | null = 'cli-kit'): Commit => ({
    hash,
    author_id: 'author-1',
    date: '2026-01-01T00:00:00Z',
    message,
    body: '',
    refs: null,
    type: 'feat',
    scope,
    is_breaking_change: false,
});

describe('ChangelogBuilder', () => {
    it('reports and backfills entries', async () => {
        const commits = [
            buildCommit('a1', 'feat(cli-kit): init', 'cli-kit'),
            buildCommit('b1', 'chore: root metadata', null),
        ];
        const commitsByPackage = new Map<string, Commit[]>();
        commitsByPackage.set('packages/cli-kit', [commits[0] as Commit]);
        const info = new FakePackageInfo(commits, '@axm-internal/cli-kit@0.1.0', 'cli-kit', commitsByPackage, [
            commits[1] as Commit,
        ]);
        const store = new MemoryStore();
        const builder = new ChangelogBuilder(info as unknown as PackageInfoService, store as unknown as ChangelogStore);
        const targets = ['packages/cli-kit'] as PackageApp[];

        const report = await builder.report(targets);
        expect(report.needsBackfill).toBe(1);

        const applied = await builder.backfill(targets);
        expect(applied.needsBackfill).toBe(1);

        const scopeData = await store.readScope('cli-kit');
        expect(scopeData.entries).toHaveLength(1);

        const rootData = await store.readRoot();
        const rootEntry = rootData.entries[0];
        const rootLines = rootEntry?.summaryLines ?? [];
        expect(rootLines).toContain('chore: root metadata');
        expect(rootLines).not.toContain('feat(cli-kit): init');
    });

    it('continues backfill for non-publishable scopes using changelog metadata', async () => {
        const commits = [
            buildCommit('a1', 'feat(repo-cli): init', 'repo-cli'),
            buildCommit('b1', 'feat(repo-cli): next', 'repo-cli'),
        ];
        const commitsByPackage = new Map<string, Commit[]>();
        commitsByPackage.set('apps/repo-cli', commits);
        const info = new FakePackageInfo(commits, null, 'repo-cli', commitsByPackage, []);
        const store = new MemoryStore();
        await store.writeScope({
            scope: 'repo-cli',
            entries: [
                {
                    version: '2026-01-01T00:00:00Z',
                    tag: null,
                    fromHash: 'a1',
                    toHash: 'a1',
                    rangeStartDate: '2026-01-01T00:00:00.000Z',
                    rangeEndDate: '2026-01-01T00:00:00.000Z',
                    summaryLines: ['feat(repo-cli): init'],
                    createdAt: '2026-01-01T00:00:00Z',
                },
            ],
        });
        const builder = new ChangelogBuilder(info as unknown as PackageInfoService, store as unknown as ChangelogStore);
        const targets = ['apps/repo-cli'] as PackageApp[];

        const report = await builder.report(targets);
        expect(report.needsBackfill).toBe(1);

        await builder.backfill(targets);
        const scopeData = await store.readScope('repo-cli');
        expect(scopeData.entries.length).toBe(2);
        const latest = scopeData.entries[1];
        expect(latest?.summaryLines).toContain('feat(repo-cli): next');
        expect(latest?.version).toBe(commits[1]?.date);
    });

    it('includes commits that touch a package even when the scope differs', async () => {
        const commits = [
            buildCommit('a1', 'fix(repo-cli): touched cli-kit', 'repo-cli'),
            buildCommit('b1', 'feat(cli-kit): scoped', 'cli-kit'),
        ];
        const commitsByPackage = new Map<string, Commit[]>();
        commitsByPackage.set('packages/cli-kit', commits);
        const info = new FakePackageInfo(commits, '@axm-internal/cli-kit@0.1.0', 'cli-kit', commitsByPackage, []);
        const store = new MemoryStore();
        const builder = new ChangelogBuilder(info as unknown as PackageInfoService, store as unknown as ChangelogStore);
        const targets = ['packages/cli-kit'] as PackageApp[];

        await builder.backfill(targets);
        const scopeData = await store.readScope('cli-kit');
        const lines = scopeData.entries[0]?.summaryLines ?? [];
        expect(lines).toContain('fix(repo-cli): touched cli-kit');
        expect(lines).toContain('feat(cli-kit): scoped');
    });

    it('renders markdown changelogs from stored entries', async () => {
        const commits = [buildCommit('a1', 'feat(cli-kit): init')];
        const info = new FakePackageInfo(commits, '@axm-internal/cli-kit@0.1.0');
        const store = new MemoryStore();
        const builder = new ChangelogBuilder(info as unknown as PackageInfoService, store as unknown as ChangelogStore);
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'changelog-md-'));
        const cwd = process.cwd();

        await store.writeScope({
            scope: 'cli-kit',
            entries: [
                {
                    version: '0.1.0',
                    tag: '@axm-internal/cli-kit@0.1.0',
                    fromHash: 'a1',
                    toHash: 'a1',
                    rangeStartDate: '2026-01-01T00:00:00.000Z',
                    rangeEndDate: '2026-01-01T00:00:00.000Z',
                    summaryLines: ['feat(cli-kit): init'],
                    createdAt: '2026-01-01T00:00:00.000Z',
                },
            ],
        });
        await store.writeRoot({
            entries: [
                {
                    scope: 'cli-kit',
                    version: '0.1.0',
                    tag: '@axm-internal/cli-kit@0.1.0',
                    fromHash: 'a1',
                    toHash: 'a1',
                    rangeStartDate: '2026-01-01T00:00:00.000Z',
                    rangeEndDate: '2026-01-01T00:00:00.000Z',
                    summaryLines: ['feat(cli-kit): init'],
                    createdAt: '2026-01-01T00:00:00.000Z',
                },
            ],
        });

        try {
            process.chdir(repoRoot);
            await fs.promises.mkdir(path.join(repoRoot, 'packages/cli-kit'), { recursive: true });
            await builder.writeMarkdown(['packages/cli-kit']);
        } finally {
            process.chdir(cwd);
        }

        const packageChangelog = await Bun.file(path.join(repoRoot, 'packages/cli-kit/CHANGELOG.md')).text();
        const rootChangelog = await Bun.file(path.join(repoRoot, 'CHANGELOG.md')).text();

        expect(packageChangelog.includes('## 0.1.0')).toBe(true);
        expect(rootChangelog.includes('## 2026-01-01T00:00:00.000Z')).toBe(true);
    });

    it('resolves package targets from flags', () => {
        const single = resolvePackageTargets('packages/cli-kit');
        expect(single).toEqual(['packages/cli-kit']);

        const all = resolvePackageTargets(undefined, true);
        expect(all.length).toBeGreaterThan(0);
    });

    it('reports updates based on latest commit', async () => {
        const commits = [buildCommit('a1', 'feat(cli-kit): init'), buildCommit('b1', 'feat(cli-kit): next')];
        const commitsByPackage = new Map<string, Commit[]>();
        commitsByPackage.set('packages/cli-kit', commits);
        const info = new FakePackageInfo(commits, '@axm-internal/cli-kit@0.1.0', 'cli-kit', commitsByPackage, []);
        const store = new MemoryStore();
        await store.writeScope({
            scope: 'cli-kit',
            entries: [
                {
                    version: '0.1.0',
                    tag: '@axm-internal/cli-kit@0.1.0',
                    fromHash: 'a1',
                    toHash: 'a1',
                    rangeStartDate: '2026-01-01T00:00:00.000Z',
                    rangeEndDate: '2026-01-01T00:00:00.000Z',
                    summaryLines: ['feat(cli-kit): init'],
                    createdAt: '2026-01-01T00:00:00.000Z',
                },
            ],
        });

        const builder = new ChangelogBuilder(info as unknown as PackageInfoService, store as unknown as ChangelogStore);
        const report = await builder.reportUpdate(['packages/cli-kit']);

        expect(info.indexCalls).toBe(1);
        expect(report.updated).toBe(1);
        expect(report.items[0]?.fromHash).toBe('b1');
        expect(report.items[0]?.toHash).toBe('b1');
    });

    it('appends update entries using latest commit range', async () => {
        const commits = [buildCommit('a1', 'feat(cli-kit): init'), buildCommit('b1', 'feat(cli-kit): next')];
        const rootCommit = buildCommit('r1', 'chore: root update', null);
        const commitsByPackage = new Map<string, Commit[]>();
        commitsByPackage.set('packages/cli-kit', commits);
        const info = new FakePackageInfo(commits, '@axm-internal/cli-kit@0.1.0', 'cli-kit', commitsByPackage, [
            rootCommit,
        ]);
        const store = new MemoryStore();
        await store.writeScope({
            scope: 'cli-kit',
            entries: [
                {
                    version: '0.1.0',
                    tag: '@axm-internal/cli-kit@0.1.0',
                    fromHash: 'a1',
                    toHash: 'a1',
                    rangeStartDate: '2026-01-01T00:00:00.000Z',
                    rangeEndDate: '2026-01-01T00:00:00.000Z',
                    summaryLines: ['feat(cli-kit): init'],
                    createdAt: '2026-01-01T00:00:00.000Z',
                },
            ],
        });

        const builder = new ChangelogBuilder(info as unknown as PackageInfoService, store as unknown as ChangelogStore);
        const applied = await builder.update(['packages/cli-kit']);

        expect(applied.updated).toBe(1);

        const scopeData = await store.readScope('cli-kit');
        expect(scopeData.entries.length).toBe(2);
        expect(scopeData.entries[1]?.summaryLines).toContain('feat(cli-kit): next');

        const rootData = await store.readRoot();
        expect(rootData.entries.length).toBe(1);
        expect(rootData.entries[0]?.summaryLines).toContain('chore: root update');
    });
});
