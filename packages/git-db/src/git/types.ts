export type GitCommitLog = {
    hash: string;
    authorName: string;
    authorEmail: string;
    date: string; // ISO
    message: string; // subject
    body: string; // body text
    refs: string | null;
};

export type ReadCommitOptions = {
    sinceHash?: string;
    includeMerges?: boolean;
    limit?: number;
    skip?: number;
    sinceDate?: string;
    untilDate?: string;
};

export type ReadCommitFilesOptions = {
    hash: string;
};
