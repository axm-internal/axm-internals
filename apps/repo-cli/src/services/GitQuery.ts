import path from 'node:path';
import {
    type Commit,
    type CommitScanResult,
    type DbClient,
    findCommitByHash,
    findCommitByTag,
    findCommitsAfterHash,
    findCommitsBetweenHashes,
    findCommitsBetweenHashesAll,
    findCommitsBetweenHashesUnscoped,
    findCommitsByScope,
    findCommitsByScopeAndPath,
    findCommitsByTagPrefix,
    findHeadCommit,
    getLatestReleaseTagForScope,
    listReleaseTags,
    listReleaseTagsForScope,
    openBunDb,
    scanCommits,
} from '@axm-internal/git-db';
import { findRepoRoot } from '../utils/findRepoRoot';

const buildDbPath = (): string => {
    const repoRoot = findRepoRoot('.');
    return path.join(repoRoot, '.git-db', 'database.sqlite');
};

type GitQueryParams = {
    dbPath?: string;
};

const firstCommit = (commits: Commit[]): Commit | null => {
    let earliest: Commit | null = null;

    for (const commit of commits) {
        if (!earliest || new Date(commit.date) < new Date(earliest.date)) {
            earliest = commit;
        }
    }

    return earliest;
};

const getPackageTagPrefix = (scope: string): string => {
    return `@axm-internal/${scope}@`;
};

export class GitQuery {
    public readonly dbPath: string;
    protected db: DbClient | null = null;

    constructor(options?: GitQueryParams) {
        this.dbPath = options?.dbPath ?? buildDbPath();
    }

    async getDb(): Promise<DbClient> {
        if (!this.db) {
            this.db = await openBunDb(this.dbPath);
        }

        return this.db;
    }

    async closeDb() {
        if (!this.db) {
            return;
        }

        await this.db.destroy();
        this.db = null;
    }

    async updateDb(): Promise<CommitScanResult> {
        const db = await this.getDb();

        return scanCommits(db, {
            includeMerges: true,
        });
    }

    async getFirstCommit(scope: string): Promise<Commit | null> {
        const db = await this.getDb();
        const commits: Commit[] = await findCommitsByScope(db, scope);

        return firstCommit(commits);
    }

    async getTags(scope: string): Promise<Commit[]> {
        const db = await this.getDb();
        const tagPrefix = getPackageTagPrefix(scope);
        return findCommitsByTagPrefix(db, tagPrefix);
    }

    async getLatestCommit(scope: string): Promise<Commit | null> {
        const db = await this.getDb();
        const commits = await findCommitsByScope(db, scope);
        if (commits.length === 0) {
            return null;
        }

        return commits.sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
    }

    async listReleaseTags(): Promise<string[]> {
        return listReleaseTags();
    }

    async listReleaseTagsForScope(scope: string): Promise<string[]> {
        return listReleaseTagsForScope(scope, 'newest-first');
    }

    async getLatestTagForScope(scope: string): Promise<string | null> {
        return getLatestReleaseTagForScope(scope);
    }

    async getCommitByHash(hash: string): Promise<Commit | null> {
        const db = await this.getDb();
        return findCommitByHash(db, hash);
    }

    async getHeadCommit(): Promise<Commit | null> {
        const db = await this.getDb();
        return findHeadCommit(db);
    }

    async getCommitForTag(tag: string): Promise<Commit | null> {
        const db = await this.getDb();
        return findCommitByTag(db, tag);
    }

    async getCommitBetween(scope: string, fromCommit?: Commit | null, toCommit?: Commit | null): Promise<Commit[]> {
        if (!fromCommit || !toCommit) {
            return [];
        }

        const db = await this.getDb();
        return findCommitsBetweenHashes(db, scope, fromCommit.hash, toCommit.hash);
    }

    async getCommitsBetweenHashes(scope: string, fromHash: string, toHash: string): Promise<Commit[]> {
        const db = await this.getDb();
        return findCommitsBetweenHashes(db, scope, fromHash, toHash);
    }

    async getCommitsAfterHash(scope: string, fromHash: string, toHash: string): Promise<Commit[]> {
        const db = await this.getDb();
        return findCommitsAfterHash(db, scope, fromHash, toHash);
    }

    async getCommitsBetweenHashesForPackage(
        scope: string,
        pathPrefix: string,
        fromHash: string,
        toHash: string
    ): Promise<Commit[]> {
        const db = await this.getDb();
        return findCommitsByScopeAndPath(db, scope, pathPrefix, fromHash, toHash);
    }

    async getCommitsBetweenHashesUnscoped(fromHash: string, toHash: string): Promise<Commit[]> {
        const db = await this.getDb();
        return findCommitsBetweenHashesUnscoped(db, fromHash, toHash);
    }

    async getCommitsBetweenHashesAll(fromHash: string, toHash: string): Promise<Commit[]> {
        const db = await this.getDb();
        return findCommitsBetweenHashesAll(db, fromHash, toHash);
    }
}
