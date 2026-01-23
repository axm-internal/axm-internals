import type { DbClient } from '../db/client';
import type { Commit } from '../db/types';

export const listFiles = async (
    db: DbClient,
    opts: { limit?: number; offset?: number } = {}
): Promise<{ hash: string; path: string; status: string }[]> => {
    const { limit, offset } = opts;
    let query = db.selectFrom('commit_files').select(['hash', 'path', 'status']).orderBy('path', 'asc');
    if (typeof limit === 'number') {
        query = query.limit(limit);
    }
    if (typeof offset === 'number') {
        query = query.offset(offset);
    }
    return query.execute();
};

export const findCommitsByPath = async (db: DbClient, pathPrefix: string): Promise<Commit[]> => {
    return db
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
        .orderBy('commits.date', 'desc')
        .execute();
};
