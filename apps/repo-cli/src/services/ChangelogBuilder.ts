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

export interface UpdateReport {
    total: number;
    updated: number;
    ok: number;
    items: Array<{
        scope: string;
        packagePath: PackageApp;
        updated: boolean;
        fromHash: string | null;
        toHash: string | null;
        fromDate: string | null;
        toDate: string | null;
    }>;
}

export class ChangelogBuilder {
    protected packageInfo: PackageInfoService;
    protected store: ChangelogStore;

    constructor(packageInfo: PackageInfoService, store: ChangelogStore) {
        this.packageInfo = packageInfo;
        this.store = store;
    }

    protected isPublishable(packagePath: PackageApp): boolean {
        return packagePath.startsWith('packages/') && packagePath !== 'packages/tooling-config';
    }

    protected getLatestEntry(scopeData: ScopeChangelog): ChangelogEntry | null {
        if (scopeData.entries.length === 0) {
            return null;
        }
        return scopeData.entries.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
    }

    protected removeCommit(commits: Commit[], hash: string | null): Commit[] {
        if (!hash) {
            return commits;
        }
        return commits.filter((commit) => commit.hash !== hash);
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

            if (!info.fromCommit || !info.toCommit) {
                continue;
            }

            await this.addEntry(
                info.scope,
                info.firstTagName,
                info.fromCommit,
                info.toCommit,
                info.scopeCommits,
                info.rootCommits,
                info.versionOverride
            );
        }

        const needsBackfill = reportItems.filter((item) => item.needsBackfill).length;

        return {
            total: reportItems.length,
            needsBackfill,
            ok: reportItems.length - needsBackfill,
            items: reportItems,
        };
    }

    async update(targets: PackageApp[]): Promise<UpdateReport> {
        await this.packageInfo.indexDb();
        const reportItems: UpdateReport['items'] = [];

        for (const target of targets) {
            const info = await this.buildUpdateInfo(target);

            reportItems.push({
                scope: info.scope,
                packagePath: target,
                updated: info.updated,
                fromHash: info.fromCommit?.hash ?? null,
                toHash: info.toCommit?.hash ?? null,
                fromDate: info.fromCommit?.date ?? null,
                toDate: info.toCommit?.date ?? null,
            });

            if (!info.updated) {
                continue;
            }

            if (!info.fromCommit || !info.toCommit) {
                continue;
            }

            await this.addEntry(
                info.scope,
                null,
                info.fromCommit,
                info.toCommit,
                info.scopeCommits,
                info.rootCommits,
                info.versionOverride
            );
        }

        const updated = reportItems.filter((item) => item.updated).length;

        return {
            total: reportItems.length,
            updated,
            ok: reportItems.length - updated,
            items: reportItems,
        };
    }

    async reportUpdate(targets: PackageApp[]): Promise<UpdateReport> {
        await this.packageInfo.indexDb();
        const reportItems: UpdateReport['items'] = [];

        for (const target of targets) {
            const info = await this.buildUpdateInfo(target);
            reportItems.push({
                scope: info.scope,
                packagePath: target,
                updated: info.updated,
                fromHash: info.fromCommit?.hash ?? null,
                toHash: info.toCommit?.hash ?? null,
                fromDate: info.fromCommit?.date ?? null,
                toDate: info.toCommit?.date ?? null,
            });
        }

        const updated = reportItems.filter((item) => item.updated).length;
        return {
            total: reportItems.length,
            updated,
            ok: reportItems.length - updated,
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

    protected async addEntry(
        scope: string,
        tagName: string | null,
        fromCommit: Commit,
        toCommit: Commit,
        scopeCommits: Commit[],
        rootCommits: Commit[],
        versionOverride?: string
    ) {
        const entry = this.buildEntry(tagName, fromCommit, toCommit, scopeCommits, versionOverride);
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
            const rootEntry = this.buildEntry(tagName, fromCommit, toCommit, rootCommits, versionOverride);
            if (rootEntry.summaryLines.length === 0) {
                return;
            }
            const nextRoot: RootChangelog = {
                entries: [
                    ...rootData.entries,
                    {
                        scope,
                        version: rootEntry.version,
                        tag: rootEntry.tag,
                        fromHash: rootEntry.fromHash,
                        toHash: rootEntry.toHash,
                        rangeStartDate: rootEntry.rangeStartDate,
                        rangeEndDate: rootEntry.rangeEndDate,
                        summaryLines: rootEntry.summaryLines,
                        createdAt: rootEntry.createdAt,
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
        const scopeData = await this.store.readScope(scope);
        const lastEntry = this.getLatestEntry(scopeData);
        const isPublishable = this.isPublishable(target);

        if (!isPublishable) {
            const lastHash = lastEntry?.toHash ?? null;
            const lastCommit = lastHash ? await this.packageInfo.commitByHash(lastHash) : null;
            const latestCommit = await this.packageInfo.latest(scope);
            const startCommit = lastCommit ?? fromCommit;
            const endCommit = latestCommit;
            const scopeCommits =
                startCommit && endCommit
                    ? await this.packageInfo.commitsForPackage(target, scope, startCommit.hash, endCommit.hash)
                    : [];
            const rootCommitsAll =
                startCommit && endCommit
                    ? await this.packageInfo.commitsUnscoped(startCommit.hash, endCommit.hash)
                    : [];
            const nextScopeCommits = this.removeCommit(scopeCommits, lastHash);
            const nextRootCommits = this.removeCommit(rootCommitsAll, lastHash);
            const needsBackfill = Boolean(nextScopeCommits.length > 0);
            const versionOverride = endCommit?.date ?? new Date().toISOString();

            return {
                scope,
                firstTagName: null,
                fromCommit: nextScopeCommits[0] ?? startCommit,
                toCommit: endCommit,
                scopeCommits: nextScopeCommits,
                rootCommits: nextRootCommits,
                needsBackfill,
                versionOverride,
            };
        }

        const toCommit = firstTagName ? await this.packageInfo.commitForTag(firstTagName) : null;
        const scopeCommits =
            fromCommit && toCommit
                ? await this.packageInfo.commitsForPackage(target, scope, fromCommit.hash, toCommit.hash)
                : [];
        const rootCommits =
            fromCommit && toCommit ? await this.packageInfo.commitsUnscoped(fromCommit.hash, toCommit.hash) : [];
        const hasEntry = this.hasEntry(scopeData, firstTagName);
        const needsBackfill = Boolean(firstTagName && fromCommit && toCommit && !hasEntry);

        return {
            scope,
            firstTagName,
            fromCommit,
            toCommit,
            scopeCommits,
            rootCommits,
            needsBackfill,
        };
    }

    protected async buildUpdateInfo(target: PackageApp) {
        const [, scope] = splitPackageApp(target);
        ensureValidScope(scope);
        const refs = await this.packageInfo.refs(scope);
        const scopeData = await this.store.readScope(scope);
        const lastEntry = this.getLatestEntry(scopeData);
        const lastHash = lastEntry?.toHash ?? null;
        const lastCommit = lastHash ? await this.packageInfo.commitByHash(lastHash) : null;
        const latestCommit = await this.packageInfo.latest(scope);
        const startCommit = lastCommit ?? refs.first;
        const endCommit = latestCommit;

        const scopeCommits =
            startCommit && endCommit
                ? await this.packageInfo.commitsForPackage(target, scope, startCommit.hash, endCommit.hash)
                : [];
        const rootCommitsAll =
            startCommit && endCommit ? await this.packageInfo.commitsUnscoped(startCommit.hash, endCommit.hash) : [];

        const nextScopeCommits = this.removeCommit(scopeCommits, lastHash);
        const nextRootCommits = this.removeCommit(rootCommitsAll, lastHash);
        const updated = Boolean(nextScopeCommits.length > 0);
        const versionOverride = endCommit?.date ?? new Date().toISOString();

        return {
            scope,
            fromCommit: nextScopeCommits[0] ?? startCommit,
            toCommit: endCommit,
            scopeCommits: nextScopeCommits,
            rootCommits: nextRootCommits,
            updated,
            versionOverride,
        };
    }

    protected hasEntry(scopeData: ScopeChangelog, tagName: string | null): boolean {
        if (!tagName) {
            return false;
        }
        const version = this.extractVersion(tagName);
        return scopeData.entries.some((item) => item.tag === tagName || (version && item.version === version));
    }

    protected buildEntry(
        tagName: string | null,
        fromCommit: Commit,
        toCommit: Commit,
        commits: Commit[],
        versionOverride?: string
    ): ChangelogEntry {
        const version = versionOverride ?? this.extractVersion(tagName) ?? '0.0.0';
        const summaryLines = commits
            .map((commit) => commit.message)
            .filter((message) => Boolean(message) && !message.startsWith('Merge '));
        return {
            version,
            tag: tagName,
            fromHash: fromCommit.hash,
            toHash: toCommit.hash,
            rangeStartDate: fromCommit.date,
            rangeEndDate: toCommit.date,
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
            .sort((a, b) => b.rangeEndDate.localeCompare(a.rangeEndDate))
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
            .sort((a, b) => b.rangeEndDate.localeCompare(a.rangeEndDate))
            .map((entry) => {
                const bullets = entry.summaryLines.map((line) => `- ${line}`).join('\n');
                return `## ${entry.rangeEndDate}\n${bullets}`;
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
