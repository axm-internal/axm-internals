import type { Commit } from '@axm-internal/git-db';
import { isValidPackageApp, type PackageApp } from '../schemas/PackageAppSchema';
import type { GitQuery } from './GitQuery';

export type RefsData = { first: Commit | null; tags: Commit[] | null; latestTagName: string | null };

/**
 * Ensure a conventional-commit scope maps to a known app/package.
 *
 * @param scope - Conventional commit scope (e.g., `cli-kit`).
 * @throws If the scope is not represented by `apps/<scope>` or `packages/<scope>`.
 */
export const ensureValidScope = (scope: string) => {
    const isValid = isValidPackageApp(`apps/${scope}`) || isValidPackageApp(`packages/${scope}`);
    if (!isValid) {
        throw new Error(`Invalid scope given ${scope}`);
    }
};

export class PackageInfoService {
    protected gitQuery: GitQuery;

    /**
     * Create a package metadata service backed by GitQuery.
     *
     * @param gitQuery - Service that queries git-db and git tags.
     */
    constructor(gitQuery: GitQuery) {
        this.gitQuery = gitQuery;
    }

    /**
     * Close the underlying git-db connection.
     *
     * @returns Resolves when the DB is closed.
     */
    async closeDb() {
        return this.gitQuery.closeDb();
    }

    /**
     * Index git history into git-db and close the DB connection.
     *
     * @returns Resolves when indexing is complete.
     */
    async indexDb(): Promise<void> {
        await this.gitQuery.updateDb();
        await this.gitQuery.closeDb();
    }

    /**
     * Resolve the first commit, tagged commits, and latest tag name for a scope.
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @returns First commit, commits containing refs, and latest tag name.
     */
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

    /**
     * Fetch the latest commit for a scope.
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @returns Latest commit or null if none exist.
     */
    async latest(scope: string): Promise<Commit | null> {
        ensureValidScope(scope);
        return await this.gitQuery.getLatestCommit(scope);
    }

    /**
     * Resolve the commit for a git tag.
     *
     * @param tag - Tag name (e.g., `@axm-internal/cli-kit@0.1.0`).
     * @returns Tagged commit or null if missing.
     */
    async commitForTag(tag: string): Promise<Commit | null> {
        return await this.gitQuery.getCommitForTag(tag);
    }

    /**
     * Resolve a commit by hash.
     *
     * @param hash - Commit hash.
     * @returns Commit or null if missing.
     */
    async commitByHash(hash: string): Promise<Commit | null> {
        return await this.gitQuery.getCommitByHash(hash);
    }

    /**
     * Fetch commits for a scope between two hashes (inclusive).
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @param fromHash - Start hash (inclusive).
     * @param toHash - End hash (inclusive).
     * @returns Ordered commits for the scope.
     */
    async commits(scope: string, fromHash: string, toHash: string): Promise<Commit[]> {
        ensureValidScope(scope);
        return await this.gitQuery.getCommitsBetweenHashes(scope, fromHash, toHash);
    }

    /**
     * Fetch commits for a scope or matching file paths between two hashes.
     *
     * @param packagePath - Package or app path (e.g., `packages/cli-kit`).
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @param fromHash - Start hash (inclusive).
     * @param toHash - End hash (inclusive).
     * @returns Ordered commits for the package/app.
     */
    async commitsForPackage(
        packagePath: PackageApp,
        scope: string,
        fromHash: string,
        toHash: string
    ): Promise<Commit[]> {
        ensureValidScope(scope);
        const pathPrefix = packagePath.endsWith('/') ? packagePath : `${packagePath}/`;
        return await this.gitQuery.getCommitsBetweenHashesForPackage(scope, pathPrefix, fromHash, toHash);
    }

    /**
     * Fetch unscoped commits between two hashes (inclusive).
     *
     * @param fromHash - Start hash (inclusive).
     * @param toHash - End hash (inclusive).
     * @returns Ordered commits without a scope.
     */
    async commitsUnscoped(fromHash: string, toHash: string): Promise<Commit[]> {
        return await this.gitQuery.getCommitsBetweenHashesUnscoped(fromHash, toHash);
    }

    /**
     * Fetch commits between two hashes (inclusive) without scope filtering.
     *
     * @param fromHash - Start hash (inclusive).
     * @param toHash - End hash (inclusive).
     * @returns Ordered commits between the two hashes.
     */
    async commitsAll(fromHash: string, toHash: string): Promise<Commit[]> {
        return await this.gitQuery.getCommitsBetweenHashesAll(fromHash, toHash);
    }

    /**
     * List release tags grouped by scope.
     *
     * @param scope - Optional scope filter (e.g., `cli-kit`).
     * @returns Grouped release tags.
     */
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

    /**
     * List release tags for a specific scope (newest first).
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @returns Tags for the scope in newest-first order.
     */
    async releaseTags(scope: string): Promise<string[]> {
        ensureValidScope(scope);
        return await this.gitQuery.listReleaseTagsForScope(scope);
    }
}
