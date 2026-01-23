import type { DbClient } from '../db/client';
import type { Author } from '../db/types';

export const listAuthors = async (db: DbClient, opts: { limit?: number; offset?: number } = {}): Promise<Author[]> => {
    const { limit, offset } = opts;
    let query = db.selectFrom('authors').selectAll().orderBy('email', 'asc');
    if (typeof limit === 'number') {
        query = query.limit(limit);
    }
    if (typeof offset === 'number') {
        query = query.offset(offset);
    }
    return query.execute();
};

export const findAuthors = async (db: DbClient, query: string): Promise<Author[]> => {
    return db
        .selectFrom('authors')
        .selectAll()
        .where((eb) => eb.or([eb('authors.name', 'like', `%${query}%`), eb('authors.email', 'like', `%${query}%`)]))
        .orderBy('authors.email', 'asc')
        .execute();
};
