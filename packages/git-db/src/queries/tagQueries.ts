import { sql } from 'kysely';
import type { DbClient } from '../db/client';
import type { Commit } from '../db/types';
import { getHeadHash, resolveTag } from '../git/tags';

const escapeLikePattern = (value: string): string =>
    value.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');

export type { TagInfo } from '../git/tags';
export {
    getHeadHash,
    getLatestReleaseTagForScope,
    listReleaseTags,
    listReleaseTagsForScope,
    resolveTag,
} from '../git/tags';

export const findCommitsByTagPrefix = async (db: DbClient, tagPrefix: string): Promise<Commit[]> => {
    const pattern = `%${escapeLikePattern(tagPrefix)}%`;
    return db
        .selectFrom('commits')
        .selectAll()
        .where(sql<boolean>`refs like ${pattern} escape '\\'`)
        .orderBy('date', 'desc')
        .execute();
};

export const findCommitByTag = async (db: DbClient, tag: string): Promise<Commit | null> => {
    let hash: string;
    try {
        hash = await resolveTag(tag);
    } catch (error: unknown) {
        if (error instanceof Error && 'exitCode' in error) {
            return null;
        }
        throw error;
    }

    if (!hash) {
        return null;
    }

    const commit = await db.selectFrom('commits').selectAll().where('hash', '=', hash).executeTakeFirst();
    return commit ?? null;
};

export const findHeadCommit = async (db: DbClient): Promise<Commit | null> => {
    const hash = await getHeadHash();
    if (!hash) {
        return null;
    }

    const commit = await db.selectFrom('commits').selectAll().where('hash', '=', hash).executeTakeFirst();
    return commit ?? null;
};
