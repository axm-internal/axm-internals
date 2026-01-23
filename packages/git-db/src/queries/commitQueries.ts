import type { DbClient } from '../db/client';
import type { Commit } from '../db/types';

export const listCommits = async (db: DbClient, opts: { limit?: number; offset?: number } = {}): Promise<Commit[]> => {
    const { limit, offset } = opts;
    let query = db.selectFrom('commits').selectAll().orderBy('date', 'desc');
    if (typeof limit === 'number') {
        query = query.limit(limit);
    }
    if (typeof offset === 'number') {
        query = query.offset(offset);
    }
    return query.execute();
};

export const findCommitsByMessage = async (db: DbClient, query: string): Promise<Commit[]> => {
    return db
        .selectFrom('commits')
        .selectAll()
        .where('message', 'like', `%${query}%`)
        .orderBy('date', 'desc')
        .execute();
};

export const findCommitsBetween = async (db: DbClient, fromHash: string, toHash: string): Promise<Commit[]> => {
    const [fromRow, toRow] = await Promise.all([
        db.selectFrom('commits').select(['date']).where('hash', '=', fromHash).executeTakeFirst(),
        db.selectFrom('commits').select(['date']).where('hash', '=', toHash).executeTakeFirst(),
    ]);

    if (!fromRow?.date || !toRow?.date) {
        return [];
    }

    const [start, end] = fromRow.date <= toRow.date ? [fromRow.date, toRow.date] : [toRow.date, fromRow.date];

    return db
        .selectFrom('commits')
        .selectAll()
        .where('date', '>=', start)
        .where('date', '<=', end)
        .orderBy('date', 'desc')
        .execute();
};

export const findCommitsByAuthorEmail = async (db: DbClient, email: string): Promise<Commit[]> => {
    return db
        .selectFrom('commits')
        .innerJoin('authors', 'authors.id', 'commits.author_id')
        .select([
            'commits.hash',
            'commits.author_id',
            'commits.date',
            'commits.message',
            'commits.body',
            'commits.refs',
        ])
        .where('authors.email', '=', email)
        .orderBy('commits.date', 'desc')
        .execute();
};
