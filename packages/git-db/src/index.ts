export type { DbClient, RepoIndexState } from './db/client';
export { openBunDb, openBunWorkerDb, openNodeDb } from './db/client';
export type { Author, Commit, CommitFile, MetaEntry } from './db/types';
export { listHashesAfter, listHashesBetween } from './git/ranges';
export { parseTag } from './git/tags';
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
export {
    findCommitsAfterHash,
    findCommitsBetweenHashes,
    findCommitsBetweenHashesAll,
    findCommitsBetweenHashesUnscoped,
    findCommitsByScopeAndPath,
} from './queries/rangeQueries';
export type { TagInfo } from './queries/tagQueries';
export {
    findCommitByTag,
    findCommitsByTagPrefix,
    findHeadCommit,
    getLatestReleaseTagForScope,
    listReleaseTags,
    listReleaseTagsForScope,
    resolveTag,
} from './queries/tagQueries';
