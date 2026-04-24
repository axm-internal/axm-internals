import type { DbClient } from '../db/client';
import type { Commit } from '../db/types';
import { listHashesAfter, listHashesBetween } from '../git/ranges';

const orderCommitsByHashes = (commits: Commit[], hashes: string[]): Commit[] => {
    const commitByHash = new Map(commits.map((commit) => [commit.hash, commit]));
    return hashes.map((hash) => commitByHash.get(hash)).filter(Boolean) as Commit[];
};

type RangeQueryOptions = {
    scope?: string | null;
    scopeIsNull?: boolean;
};

const queryCommitsInRange = async (db: DbClient, hashes: string[], opts: RangeQueryOptions = {}): Promise<Commit[]> => {
    let query = db.selectFrom('commits').selectAll().where('hash', 'in', hashes);
    if (opts.scope !== undefined && opts.scope !== null) {
        query = query.where('scope', '=', opts.scope);
    }
    if (opts.scopeIsNull) {
        query = query.where('scope', 'is', null);
    }
    const commits = await query.execute();
    return orderCommitsByHashes(commits, hashes);
};

export const findCommitsBetweenHashes = async (
    db: DbClient,
    scope: string,
    fromHash: string,
    toHash: string
): Promise<Commit[]> => {
    const hashes = await listHashesBetween(fromHash, toHash);
    if (hashes.length === 0) {
        return [];
    }
    return queryCommitsInRange(db, hashes, { scope });
};

export const findCommitsAfterHash = async (
    db: DbClient,
    scope: string,
    fromHash: string,
    toHash: string
): Promise<Commit[]> => {
    const hashes = await listHashesAfter(fromHash, toHash);
    if (hashes.length === 0) {
        return [];
    }
    return queryCommitsInRange(db, hashes, { scope });
};

export const findCommitsBetweenHashesAll = async (
    db: DbClient,
    fromHash: string,
    toHash: string
): Promise<Commit[]> => {
    const hashes = await listHashesBetween(fromHash, toHash);
    if (hashes.length === 0) {
        return [];
    }
    return queryCommitsInRange(db, hashes);
};

export const findCommitsBetweenHashesUnscoped = async (
    db: DbClient,
    fromHash: string,
    toHash: string
): Promise<Commit[]> => {
    const hashes = await listHashesBetween(fromHash, toHash);
    if (hashes.length === 0) {
        return [];
    }
    return queryCommitsInRange(db, hashes, { scopeIsNull: true });
};

export const findCommitsByScopeAndPath = async (
    db: DbClient,
    scope: string,
    pathPrefix: string,
    fromHash?: string,
    toHash?: string
): Promise<Commit[]> => {
    const normalizedPrefix = pathPrefix.endsWith('/') ? pathPrefix : `${pathPrefix}/`;

    let hashes: string[] | null = null;
    if (fromHash && toHash) {
        hashes = await listHashesBetween(fromHash, toHash);
        if (hashes.length === 0) {
            return [];
        }
    }

    const scopedQuery = db.selectFrom('commits').selectAll().where('scope', '=', scope);

    const byPathQuery = db
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
        .where('commit_files.path', 'like', `${normalizedPrefix}%`);

    const [scoped, byPath] = await Promise.all([
        hashes ? scopedQuery.where('hash', 'in', hashes).execute() : scopedQuery.execute(),
        hashes ? byPathQuery.where('commits.hash', 'in', hashes).execute() : byPathQuery.execute(),
    ]);

    const commitByHash = new Map<string, Commit>();
    for (const commit of scoped) {
        commitByHash.set(commit.hash, commit);
    }
    for (const commit of byPath) {
        commitByHash.set(commit.hash, commit);
    }

    if (hashes) {
        return orderCommitsByHashes(Array.from(commitByHash.values()), hashes);
    }

    return Array.from(commitByHash.values()).sort((a, b) => b.date.localeCompare(a.date));
};
