import path from 'node:path';
import {
    type Commit,
    type CommitScanResult,
    type DbClient,
    findCommitsByScope,
    listCommits,
    openBunDb,
    scanCommits,
} from '@axm-internal/git-db';
import { execa } from 'execa';
import { findRepoRoot } from '../utils/findRepoRoot';

/**
 * Build the default git-db path for the current repo.
 *
 * @returns Absolute path to `.git-db/database.sqlite`.
 * @remarks
 * Uses `findRepoRoot('.')` to locate the repository root.
 * @example
 * ```ts
 * const path = buildDbPath();
 * ```
 */
const buildDbPath = (): string => {
    const repoRoot = findRepoRoot('.');
    return path.join(repoRoot, '.git-db', 'database.sqlite');
};

type GitQueryParams = {
    dbPath?: string;
};

/**
 * Find the earliest commit by date from a list.
 *
 * @param commits - Commits to scan.
 * @returns The earliest commit or null when the list is empty.
 * @remarks
 * Uses commit dates, not topological ordering.
 * @example
 * ```ts
 * const earliest = firstCommit(commits);
 * ```
 */
const firstCommit = (commits: Commit[]): Commit | null => {
    let earliest: Commit | null = null;

    for (const commit of commits) {
        if (!earliest || new Date(commit.date) < new Date(earliest.date)) {
            earliest = commit;
        }
    }

    return earliest;
};

/**
 * Build the tag prefix for a package scope.
 *
 * @param scope - Conventional commit scope (e.g., `cli-kit`).
 * @returns Tag prefix string.
 * @example
 * ```ts
 * const prefix = getPackageTagPrefix('cli-kit');
 * // "@axm-internal/cli-kit@"
 * ```
 */
const getPackageTagPrefix = (scope: string): string => {
    return `@axm-internal/${scope}@`;
};

/**
 * Git query helper backed by git-db and git CLI.
 *
 * @remarks
 * Provides scoped commit queries and tag helpers without exposing raw SQL.
 * @example
 * ```ts
 * const git = new GitQuery();
 * await git.updateDb();
 * const first = await git.getFirstCommit('cli-kit');
 * await git.closeDb();
 * ```
 */
export class GitQuery {
    /**
     * Absolute path to the git-db SQLite file.
     */
    public readonly dbPath: string;
    /**
     * Cached database client instance.
     *
     * @remarks
     * Lazily initialized by {@link getDb}.
     */
    protected db: DbClient | null = null;

    /**
     * Create a new GitQuery instance.
     *
     * @param options - Optional configuration.
     * @example
     * ```ts
     * const git = new GitQuery({ dbPath: '/path/to/db.sqlite' });
     * ```
     */
    constructor(options?: GitQueryParams) {
        this.dbPath = options?.dbPath ?? buildDbPath();
    }

    /**
     * Get or open the git-db client.
     *
     * @returns An open database client.
     * @example
     * ```ts
     * const db = await git.getDb();
     * ```
     */
    async getDb(): Promise<DbClient> {
        if (!this.db) {
            this.db = await openBunDb(this.dbPath);
        }

        return this.db;
    }

    /**
     * Close the database client if open.
     *
     * @returns Resolves when the client is closed.
     * @example
     * ```ts
     * await git.closeDb();
     * ```
     */
    async closeDb() {
        if (!this.db) {
            return;
        }

        await this.db.destroy();
        this.db = null;
    }

    /**
     * Scan git history and update the git-db index.
     *
     * @returns Scan summary metadata.
     * @example
     * ```ts
     * const result = await git.updateDb();
     * ```
     */
    async updateDb(): Promise<CommitScanResult> {
        const db = await this.getDb();

        return scanCommits(db, {
            includeMerges: true,
        });
    }

    /**
     * Get the earliest commit for a scope.
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @returns The earliest commit or null if none exist.
     * @example
     * ```ts
     * const first = await git.getFirstCommit('cli-kit');
     * ```
     */
    async getFirstCommit(scope: string): Promise<Commit | null> {
        const db = await this.getDb();
        const commits: Commit[] = await findCommitsByScope(db, scope);

        return firstCommit(commits);
    }

    /**
     * Find commits that contain release tags for a scope.
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @returns Commits whose refs include the scope tag prefix.
     * @example
     * ```ts
     * const taggedCommits = await git.getTags('cli-kit');
     * ```
     */
    async getTags(scope: string): Promise<Commit[]> {
        const db = await this.getDb();
        const commits: Commit[] = await listCommits(db);
        const tagPrefix = getPackageTagPrefix(scope);

        return commits.filter((commit) => commit.refs?.includes(tagPrefix) ?? false);
    }

    /**
     * Get the latest commit for a scope.
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @returns Latest commit or null if none exist.
     * @example
     * ```ts
     * const latest = await git.getLatestCommit('cli-kit');
     * ```
     */
    async getLatestCommit(scope: string): Promise<Commit | null> {
        const db = await this.getDb();
        const commit = await db
            .selectFrom('commits')
            .selectAll()
            .where('scope', '=', scope)
            .orderBy('date', 'desc')
            .executeTakeFirst();

        return commit ?? null;
    }

    /**
     * List all release tags in the repo.
     *
     * @returns Array of tag names.
     * @example
     * ```ts
     * const tags = await git.listReleaseTags();
     * ```
     */
    async listReleaseTags(): Promise<string[]> {
        const { stdout } = await execa('git', ['tag', '--list', '@axm-internal/*@*']);
        return stdout
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }

    /**
     * List release tags for a package scope.
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @returns Tags sorted newest-first.
     * @example
     * ```ts
     * const tags = await git.listReleaseTagsForScope('cli-kit');
     * ```
     */
    async listReleaseTagsForScope(scope: string): Promise<string[]> {
        const pattern = `${getPackageTagPrefix(scope)}*`;
        const { stdout } = await execa('git', ['tag', '--list', pattern, '--sort=-v:refname']);
        return stdout
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }

    /**
     * Get the latest release tag for a scope.
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @returns Latest tag name or null if none exist.
     * @example
     * ```ts
     * const latest = await git.getLatestTagForScope('cli-kit');
     * ```
     */
    async getLatestTagForScope(scope: string): Promise<string | null> {
        const tags = await this.listReleaseTagsForScope(scope);
        return tags[0] ?? null;
    }

    /**
     * Fetch a commit by hash from git-db.
     *
     * @param hash - Commit hash.
     * @returns Commit record or null if missing.
     * @example
     * ```ts
     * const commit = await git.getCommitByHash('abc123');
     * ```
     */
    async getCommitByHash(hash: string): Promise<Commit | null> {
        const db = await this.getDb();
        const commit = await db.selectFrom('commits').selectAll().where('hash', '=', hash).executeTakeFirst();

        return commit ?? null;
    }

    /**
     * Resolve the current HEAD commit from git-db.
     *
     * @returns HEAD commit or null if unavailable.
     * @example
     * ```ts
     * const head = await git.getHeadCommit();
     * ```
     */
    async getHeadCommit(): Promise<Commit | null> {
        const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
        const hash = stdout.trim();
        if (!hash) {
            return null;
        }

        return this.getCommitByHash(hash);
    }

    /**
     * Resolve the commit for a given tag.
     *
     * @param tag - Tag name.
     * @returns Tagged commit or null if missing.
     * @example
     * ```ts
     * const commit = await git.getCommitForTag('@axm-internal/cli-kit@0.1.0');
     * ```
     */
    async getCommitForTag(tag: string): Promise<Commit | null> {
        try {
            const { stdout } = await execa('git', ['rev-list', '-n', '1', tag]);
            const hash = stdout.trim();
            if (!hash) {
                return null;
            }

            return this.getCommitByHash(hash);
        } catch {
            return null;
        }
    }

    /**
     * List commits between two commits for a scope (inclusive).
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @param fromCommit - Start commit (inclusive).
     * @param toCommit - End commit (inclusive).
     * @returns Ordered commits between the two hashes.
     * @example
     * ```ts
     * const commits = await git.getCommitBetween('cli-kit', from, to);
     * ```
     */
    async getCommitBetween(scope: string, fromCommit?: Commit | null, toCommit?: Commit | null): Promise<Commit[]> {
        if (!fromCommit || !toCommit) {
            return [];
        }

        const hashes = await this.listHashesBetween(fromCommit.hash, toCommit.hash);

        if (hashes.length === 0) {
            return [];
        }

        const db = await this.getDb();
        const commits = await db
            .selectFrom('commits')
            .selectAll()
            .where('scope', '=', scope)
            .where('hash', 'in', hashes)
            .execute();

        const commitByHash = new Map(commits.map((commit) => [commit.hash, commit]));

        return hashes.map((hash) => commitByHash.get(hash)).filter(Boolean) as Commit[];
    }

    /**
     * List commits between two hashes for a scope (inclusive).
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @param fromHash - Start hash (inclusive).
     * @param toHash - End hash (inclusive).
     * @returns Ordered commits between the two hashes.
     * @example
     * ```ts
     * const commits = await git.getCommitsBetweenHashes('cli-kit', fromHash, toHash);
     * ```
     */
    async getCommitsBetweenHashes(scope: string, fromHash: string, toHash: string): Promise<Commit[]> {
        const hashes = await this.listHashesBetween(fromHash, toHash);

        if (hashes.length === 0) {
            return [];
        }

        const db = await this.getDb();
        const commits = await db
            .selectFrom('commits')
            .selectAll()
            .where('scope', '=', scope)
            .where('hash', 'in', hashes)
            .execute();

        const commitByHash = new Map(commits.map((commit) => [commit.hash, commit]));

        return hashes.map((hash) => commitByHash.get(hash)).filter(Boolean) as Commit[];
    }

    /**
     * List commits between two hashes for a scope or path prefix (inclusive).
     *
     * @param scope - Conventional commit scope (e.g., `cli-kit`).
     * @param pathPrefix - Path prefix (e.g., `packages/cli-kit/`).
     * @param fromHash - Start hash (inclusive).
     * @param toHash - End hash (inclusive).
     * @returns Ordered commits between the two hashes.
     * @example
     * ```ts
     * const commits = await git.getCommitsBetweenHashesForPackage('cli-kit', 'packages/cli-kit/', fromHash, toHash);
     * ```
     */
    async getCommitsBetweenHashesForPackage(
        scope: string,
        pathPrefix: string,
        fromHash: string,
        toHash: string
    ): Promise<Commit[]> {
        const hashes = await this.listHashesBetween(fromHash, toHash);

        if (hashes.length === 0) {
            return [];
        }

        const db = await this.getDb();
        const scoped = await db
            .selectFrom('commits')
            .selectAll()
            .where('scope', '=', scope)
            .where('hash', 'in', hashes)
            .execute();
        const byPath = await db
            .selectFrom('commits')
            .innerJoin('commit_files', 'commit_files.hash', 'commits.hash')
            .select([
                'commits.hash',
                'commits.author_id',
                'commits.date',
                'commits.message',
                'commits.body',
                'commits.refs',
                'commits.type',
                'commits.scope',
                'commits.is_breaking_change',
            ])
            .distinct()
            .where('commit_files.path', 'like', `${pathPrefix}%`)
            .where('commits.hash', 'in', hashes)
            .execute();

        const commitByHash = new Map<string, Commit>();
        for (const commit of scoped) {
            commitByHash.set(commit.hash, commit);
        }
        for (const commit of byPath) {
            commitByHash.set(commit.hash, commit);
        }

        return hashes.map((hash) => commitByHash.get(hash)).filter(Boolean) as Commit[];
    }

    /**
     * List unscoped commits between two hashes (inclusive).
     *
     * @param fromHash - Start hash (inclusive).
     * @param toHash - End hash (inclusive).
     * @returns Ordered commits between the two hashes.
     * @example
     * ```ts
     * const commits = await git.getCommitsBetweenHashesUnscoped(fromHash, toHash);
     * ```
     */
    async getCommitsBetweenHashesUnscoped(fromHash: string, toHash: string): Promise<Commit[]> {
        const hashes = await this.listHashesBetween(fromHash, toHash);

        if (hashes.length === 0) {
            return [];
        }

        const db = await this.getDb();
        const commits = await db
            .selectFrom('commits')
            .selectAll()
            .where('scope', 'is', null)
            .where('hash', 'in', hashes)
            .execute();

        const commitByHash = new Map(commits.map((commit) => [commit.hash, commit]));

        return hashes.map((hash) => commitByHash.get(hash)).filter(Boolean) as Commit[];
    }

    /**
     * List commits between two hashes (inclusive) without filtering by scope.
     *
     * @param fromHash - Start hash (inclusive).
     * @param toHash - End hash (inclusive).
     * @returns Ordered commits between the two hashes.
     * @example
     * ```ts
     * const commits = await git.getCommitsBetweenHashesAll(fromHash, toHash);
     * ```
     */
    async getCommitsBetweenHashesAll(fromHash: string, toHash: string): Promise<Commit[]> {
        const hashes = await this.listHashesBetween(fromHash, toHash);

        if (hashes.length === 0) {
            return [];
        }

        const db = await this.getDb();
        const commits = await db.selectFrom('commits').selectAll().where('hash', 'in', hashes).execute();
        const commitByHash = new Map(commits.map((commit) => [commit.hash, commit]));

        return hashes.map((hash) => commitByHash.get(hash)).filter(Boolean) as Commit[];
    }

    /**
     * List commit hashes between two hashes (inclusive).
     *
     * @param fromHash - Start hash (inclusive).
     * @param toHash - End hash (inclusive).
     * @returns Ordered list of hashes.
     * @example
     * ```ts
     * const hashes = await git['listHashesBetween'](fromHash, toHash);
     * ```
     */
    private async listHashesBetween(fromHash: string, toHash: string): Promise<string[]> {
        const { stdout } = await execa('git', ['rev-list', '--reverse', `${fromHash}^..${toHash}`]);
        return stdout
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    }
}
