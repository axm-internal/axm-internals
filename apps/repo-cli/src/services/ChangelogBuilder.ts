import type { Commit } from '@axm-internal/git-db';
import type { ChangelogEntry, RootChangelog, ScopeChangelog } from '../schemas/ChangelogJsonSchema';
import { isValidPackageApp, type PackageApp } from '../schemas/PackageAppSchema';
import { listPackageApps } from '../utils/listPackageApps';
import { splitPackageApp } from '../utils/splitPackageApp';
import type { ChangelogStore } from './ChangelogStore';
import { ensureValidScope, type PackageInfoService } from './PackageInfoService';

export interface BackfillReport {
    total: number;
    needsBackfill: number;
    ok: number;
    items: Array<{
        scope: string;
        packagePath: PackageApp;
        needsBackfill: boolean;
        firstTagName: string | null;
        fromHash: string | null;
        toHash: string | null;
    }>;
}

export class ChangelogBuilder {
    protected packageInfo: PackageInfoService;
    protected store: ChangelogStore;

    constructor(packageInfo: PackageInfoService, store: ChangelogStore) {
        this.packageInfo = packageInfo;
        this.store = store;
    }

    async initScopes(targets: PackageApp[]): Promise<void> {
        await this.store.ensureDir();
        for (const target of targets) {
            const [, scope] = splitPackageApp(target);
            const existing = await this.store.readScope(scope);
            if (existing.entries.length === 0) {
                await this.store.writeScope({ scope, entries: [] });
            }
        }
        const root = await this.store.readRoot();
        if (root.entries.length === 0) {
            await this.store.writeRoot({ entries: [] });
        }
    }

    async backfill(targets: PackageApp[]): Promise<BackfillReport> {
        const reportItems: BackfillReport['items'] = [];
        for (const target of targets) {
            const info = await this.buildBackfillInfo(target);

            reportItems.push({
                scope: info.scope,
                packagePath: target,
                needsBackfill: info.needsBackfill,
                firstTagName: info.firstTagName,
                fromHash: info.fromCommit?.hash ?? null,
                toHash: info.toCommit?.hash ?? null,
            });

            if (!info.needsBackfill) {
                continue;
            }

            if (!info.firstTagName || !info.fromCommit || !info.toCommit) {
                continue;
            }

            await this.addEntry(info.scope, info.firstTagName, info.fromCommit, info.toCommit, info.commits);
        }

        const needsBackfill = reportItems.filter((item) => item.needsBackfill).length;

        return {
            total: reportItems.length,
            needsBackfill,
            ok: reportItems.length - needsBackfill,
            items: reportItems,
        };
    }

    async report(targets: PackageApp[]): Promise<BackfillReport> {
        const reportItems: BackfillReport['items'] = [];
        for (const target of targets) {
            const info = await this.buildBackfillInfo(target);
            reportItems.push({
                scope: info.scope,
                packagePath: target,
                needsBackfill: info.needsBackfill,
                firstTagName: info.firstTagName,
                fromHash: info.fromCommit?.hash ?? null,
                toHash: info.toCommit?.hash ?? null,
            });
        }

        const needsBackfill = reportItems.filter((item) => item.needsBackfill).length;
        return {
            total: reportItems.length,
            needsBackfill,
            ok: reportItems.length - needsBackfill,
            items: reportItems,
        };
    }

    async writeMarkdown(targets: PackageApp[]): Promise<void> {
        const root = await this.store.readRoot();
        await this.writeRootMarkdown(root);
        for (const target of targets) {
            const [, scope] = splitPackageApp(target);
            const data = await this.store.readScope(scope);
            await this.writeScopeMarkdown(target, data);
        }
    }

    protected async addEntry(scope: string, tagName: string, fromCommit: Commit, toCommit: Commit, commits: Commit[]) {
        const entry = this.buildEntry(tagName, fromCommit, toCommit, commits);
        const scopeData = await this.store.readScope(scope);
        const hasEntry = this.hasEntry(scopeData, tagName);
        if (!hasEntry) {
            const nextScope: ScopeChangelog = {
                scope,
                entries: [...scopeData.entries, entry],
            };
            await this.store.writeScope(nextScope);
        }

        const rootData = await this.store.readRoot();
        const rootHasEntry = rootData.entries.some(
            (item) => item.scope === scope && (item.tag === tagName || item.version === entry.version)
        );
        if (!rootHasEntry) {
            const nextRoot: RootChangelog = {
                entries: [
                    ...rootData.entries,
                    {
                        scope,
                        version: entry.version,
                        tag: entry.tag,
                        fromHash: entry.fromHash,
                        toHash: entry.toHash,
                        summaryLines: entry.summaryLines,
                        createdAt: entry.createdAt,
                    },
                ],
            };
            await this.store.writeRoot(nextRoot);
        }
    }

    protected async buildBackfillInfo(target: PackageApp) {
        const [, scope] = splitPackageApp(target);
        ensureValidScope(scope);
        const tags = await this.packageInfo.releaseTags(scope);
        const firstTagName = tags.length > 0 ? (tags[tags.length - 1] ?? null) : null;
        const refs = await this.packageInfo.refs(scope);
        const fromCommit = refs.first;
        const toCommit = firstTagName ? await this.packageInfo.commitForTag(firstTagName) : null;
        const commits =
            fromCommit && toCommit ? await this.packageInfo.commits(scope, fromCommit.hash, toCommit.hash) : [];
        const scopeData = await this.store.readScope(scope);
        const hasEntry = this.hasEntry(scopeData, firstTagName);
        const needsBackfill = Boolean(firstTagName && fromCommit && toCommit && !hasEntry);

        return {
            scope,
            firstTagName,
            fromCommit,
            toCommit,
            commits,
            needsBackfill,
        };
    }

    protected hasEntry(scopeData: ScopeChangelog, tagName: string | null): boolean {
        if (!tagName) {
            return false;
        }
        const version = this.extractVersion(tagName);
        return scopeData.entries.some((item) => item.tag === tagName || (version && item.version === version));
    }

    protected buildEntry(tagName: string, fromCommit: Commit, toCommit: Commit, commits: Commit[]): ChangelogEntry {
        const version = this.extractVersion(tagName) ?? '0.0.0';
        const summaryLines = commits.map((commit) => commit.message).filter(Boolean);
        return {
            version,
            tag: tagName,
            fromHash: fromCommit.hash,
            toHash: toCommit.hash,
            summaryLines,
            createdAt: new Date().toISOString(),
        };
    }

    protected extractVersion(tagName: string | null): string | null {
        if (!tagName) {
            return null;
        }
        const match = tagName.match(/@[^@]+@(.+)$/);
        return match?.[1] ?? null;
    }

    protected async writeScopeMarkdown(packagePath: PackageApp, data: ScopeChangelog): Promise<void> {
        if (!isValidPackageApp(packagePath)) {
            return;
        }
        const filePath = `${packagePath}/CHANGELOG.md`;
        const file = Bun.file(filePath);
        const lines = data.entries
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((entry) => {
                const bullets = entry.summaryLines.map((line) => `- ${line}`).join('\n');
                return `## ${entry.version}\n${bullets}`;
            });
        const content = `${['# Changelog', ...lines].join('\n\n')}\n`;
        await Bun.write(file, content);
    }

    protected async writeRootMarkdown(data: RootChangelog): Promise<void> {
        const file = Bun.file('CHANGELOG.md');
        const lines = data.entries
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((entry) => {
                const bullets = entry.summaryLines.map((line) => `- ${line}`).join('\n');
                return `## ${entry.scope} ${entry.version}\n${bullets}`;
            });
        const content = `${['# Changelog', ...lines].join('\n\n')}\n`;
        await Bun.write(file, content);
    }
}

export const resolvePackageTargets = (packagePath?: string, all?: boolean): PackageApp[] => {
    if (all) {
        return listPackageApps().filter((entry): entry is PackageApp => isValidPackageApp(entry));
    }
    if (packagePath && isValidPackageApp(packagePath)) {
        return [packagePath as PackageApp];
    }
    return [];
};
