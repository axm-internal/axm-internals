import type { NewAuthor, NewCommit, NewCommitFile } from '../db/types';

export type CommitIndexResult = {
    commitCount: number;
    authorCount: number;
    fileCount: number;
};

export type CommitIndexBatch = {
    authors: NewAuthor[];
    commits: NewCommit[];
    files: NewCommitFile[];
};

export type CommitScanResult = {
    lastIndexedHash: string | null;
    lastIndexedDate: string | null;
    indexedCount: number;
};

export type CommitScanOptions = {
    sinceHash?: string;
    includeMerges?: boolean;
    limit?: number;
    skip?: number;
};
