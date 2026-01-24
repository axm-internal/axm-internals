export type { DbClient, RepoIndexState } from './db/client';
export { openBunDb, openBunWorkerDb, openNodeDb } from './db/client';
export type { Author, Commit, CommitFile, MetaEntry } from './db/types';
export { scanCommits } from './indexer/commitScanner';
export type { CommitScanResult } from './indexer/types';
export { findAuthors, listAuthors } from './queries/authorQueries';
export {
    findCommitsBetween,
    findCommitsByAuthorEmail,
    findCommitsByMessage,
    findCommitsByScope,
    findCommitsByType,
    listCommits,
} from './queries/commitQueries';
export { findCommitsByPath, listFiles } from './queries/fileQueries';
export { listMeta } from './queries/metaQueries';
export { findCommitsByPackage } from './queries/packageQueries';
