import { execa } from 'execa';
import type { DbClient } from '../db/client';
import type { Commit } from '../db/types';
import { resolveTag } from '../git/tags';

export type { TagInfo } from '../git/tags';
export { getLatestReleaseTagForScope, listReleaseTags, listReleaseTagsForScope, resolveTag } from '../git/tags';

export const findCommitsByTagPrefix = async (db: DbClient, tagPrefix: string): Promise<Commit[]> => {
    const commits = await db.selectFrom('commits').selectAll().orderBy('date', 'desc').execute();
    return commits.filter((commit) => commit.refs?.includes(tagPrefix) ?? false);
};

export const findCommitByTag = async (db: DbClient, tag: string): Promise<Commit | null> => {
    let hash: string;
    try {
        hash = await resolveTag(tag);
    } catch {
        return null;
    }

    if (!hash) {
        return null;
    }

    const commit = await db.selectFrom('commits').selectAll().where('hash', '=', hash).executeTakeFirst();
    return commit ?? null;
};

export const findHeadCommit = async (db: DbClient): Promise<Commit | null> => {
    const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
    const hash = stdout.trim();
    if (!hash) {
        return null;
    }

    const commit = await db.selectFrom('commits').selectAll().where('hash', '=', hash).executeTakeFirst();
    return commit ?? null;
};
