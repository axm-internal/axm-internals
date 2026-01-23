import type { DbClient } from '../db/client';
import type { Commit } from '../db/types';
import { findCommitsByPath } from './fileQueries';

export const findCommitsByPackage = async (db: DbClient, packagePath: string): Promise<Commit[]> => {
    return findCommitsByPath(db, packagePath.endsWith('/') ? packagePath : `${packagePath}/`);
};
