import type { Commit } from '@axm-internal/git-db';
import type { ChangeSetBump, ChangeSetDraft } from '../schemas/ChangeSetDraftSchema';
import { isValidPackageApp, type PackageApp } from '../schemas/PackageAppSchema';
import { splitPackageApp } from '../utils/splitPackageApp';
import { ensureValidScope, type PackageInfoService } from './PackageInfoService';

export class ChangeSetBuilder {
    protected packageInfo: PackageInfoService;

    constructor(packageInfo: PackageInfoService) {
        this.packageInfo = packageInfo;
    }

    async createForPackagePath(packagePath: string): Promise<ChangeSetDraft> {
        const [, scope] = splitPackageApp(packagePath);
        return this.createForScope(scope, packagePath);
    }

    async createForScope(scope: string, packagePath?: string): Promise<ChangeSetDraft> {
        ensureValidScope(scope);

        if (packagePath && !isValidPackageApp(packagePath)) {
            throw new Error(`Invalid package path "${packagePath}".`);
        }

        const refs = await this.packageInfo.refs(scope);
        const latestCommit = await this.packageInfo.latest(scope);
        const tagCommit = refs.latestTagName ? await this.packageInfo.commitForTag(refs.latestTagName) : null;
        const fromCommit = tagCommit ?? refs.first;
        const toCommit = latestCommit;
        let commits: Commit[] = [];
        if (fromCommit && toCommit) {
            commits = tagCommit
                ? await this.packageInfo.commitsAfter(scope, fromCommit.hash, toCommit.hash)
                : await this.packageInfo.commits(scope, fromCommit.hash, toCommit.hash);
        }
        const resolveDefaultPackagePath = (): PackageApp | undefined => {
            const packageCandidate = `packages/${scope}`;
            if (isValidPackageApp(packageCandidate)) {
                return packageCandidate as PackageApp;
            }
            const appCandidate = `apps/${scope}`;
            if (isValidPackageApp(appCandidate)) {
                return appCandidate as PackageApp;
            }
            return undefined;
        };

        const resolvedPackagePath: PackageApp | undefined =
            (packagePath as PackageApp | undefined) ?? resolveDefaultPackagePath();

        if (!resolvedPackagePath) {
            throw new Error(`Unable to resolve package path for scope "${scope}".`);
        }

        return {
            scope,
            packagePath: resolvedPackagePath,
            latestTagName: refs.latestTagName,
            fromCommit,
            toCommit,
            commits,
            suggestedBump: this.getSuggestedBump(commits),
            summaryLines: this.buildSummary(commits),
        };
    }

    async createForPackagePaths(packagePaths: string[]): Promise<ChangeSetDraft[]> {
        const drafts: ChangeSetDraft[] = [];

        for (const packagePath of packagePaths) {
            drafts.push(await this.createForPackagePath(packagePath));
        }

        return drafts;
    }

    protected getSuggestedBump(commits: Commit[]): ChangeSetBump {
        if (commits.some((commit) => commit.is_breaking_change)) {
            return 'major';
        }
        if (commits.some((commit) => commit.type === 'feat')) {
            return 'minor';
        }
        if (commits.some((commit) => commit.type === 'fix')) {
            return 'patch';
        }
        return null;
    }

    protected buildSummary(commits: Commit[]): string[] {
        return commits.map((commit) => commit.message).filter(Boolean);
    }
}
