import type { Commit } from '@axm-internal/git-db';
import { isValidPackageApp } from '../schemas/PackageAppSchema';
import type { GitQuery } from './GitQuery';

export type RefsData = { first: Commit | null; tags: Commit[] | null; latestTagName: string | null };

export const ensureValidScope = (scope: string) => {
    const isValid = isValidPackageApp(`apps/${scope}`) || isValidPackageApp(`packages/${scope}`);
    if (!isValid) {
        throw new Error(`Invalid scope given ${scope}`);
    }
};

export class PackageInfoService {
    protected gitQuery: GitQuery;

    constructor(gitQuery: GitQuery) {
        this.gitQuery = gitQuery;
    }

    async closeDb() {
        return this.gitQuery.closeDb();
    }

    async indexDb(): Promise<void> {
        await this.gitQuery.updateDb();
        await this.gitQuery.closeDb();
    }

    async refs(scope: string): Promise<RefsData> {
        ensureValidScope(scope);
        const first = await this.gitQuery.getFirstCommit(scope);
        const tags = await this.gitQuery.getTags(scope);
        const latestTagName = await this.gitQuery.getLatestTagForScope(scope);

        return {
            first,
            tags,
            latestTagName,
        };
    }

    async latest(scope: string): Promise<Commit | null> {
        ensureValidScope(scope);
        return await this.gitQuery.getLatestCommit(scope);
    }

    async commitForTag(tag: string): Promise<Commit | null> {
        return await this.gitQuery.getCommitForTag(tag);
    }

    async commits(scope: string, fromHash: string, toHash: string): Promise<Commit[]> {
        ensureValidScope(scope);
        return await this.gitQuery.getCommitsBetweenHashes(scope, fromHash, toHash);
    }

    async releases(scope?: string): Promise<Array<{ scope: string; tags: string[] }>> {
        if (scope) {
            ensureValidScope(scope);
        }

        const tags = await this.gitQuery.listReleaseTags();
        const parsed = tags
            .map((tag) => {
                const match = tag.match(/^@axm-internal\/([^@]+)@(.+)$/);
                if (!match) {
                    return null;
                }
                return { scope: match[1], tag };
            })
            .filter((value): value is { scope: string; tag: string } => value !== null);

        const filtered = scope ? parsed.filter((entry) => entry.scope === scope) : parsed;
        const grouped = new Map<string, string[]>();

        for (const entry of filtered) {
            const list = grouped.get(entry.scope) ?? [];
            list.push(entry.tag);
            grouped.set(entry.scope, list);
        }

        return Array.from(grouped.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([scopeName, tagList]) => ({
                scope: scopeName,
                tags: tagList,
            }));
    }
}
