import type { DbClient } from '../db/client';
import { getIndexState, setIndexState } from '../db/client';
import { readCommitFiles } from '../git/files';
import { readCommits } from '../git/log';
import { parseConventionalCommit } from '../utils/parseConventionalCommit';
import { indexCommitBatch } from './commitIndexer';
import type { CommitIndexBatch, CommitScanOptions, CommitScanResult } from './types';

export const scanCommits = async (db: DbClient, opts: CommitScanOptions = {}): Promise<CommitScanResult> => {
    const state = await getIndexState(db);
    const sinceHash = opts.sinceHash ?? state.lastIndexedHash ?? undefined;

    const commits = await readCommits({
        sinceHash,
        includeMerges: opts.includeMerges,
        limit: opts.limit,
        skip: opts.skip,
    });

    if (commits.length === 0) {
        return {
            lastIndexedHash: state.lastIndexedHash,
            lastIndexedDate: state.lastIndexedDate,
            indexedCount: 0,
        };
    }

    const filesByCommit = await Promise.all(
        commits.map(async (commit) => ({
            hash: commit.hash,
            files: await readCommitFiles({ hash: commit.hash }),
        }))
    );

    const authors = new Map<string, CommitIndexBatch['authors'][number]>();
    const commitRows: CommitIndexBatch['commits'] = [];
    const fileRows: CommitIndexBatch['files'] = [];

    for (const commit of commits) {
        const authorId = commit.authorEmail;
        if (!authors.has(authorId)) {
            authors.set(authorId, {
                id: authorId,
                name: commit.authorName,
                email: authorId,
            });
        }

        const conventional = parseConventionalCommit(commit.message);
        commitRows.push({
            hash: commit.hash,
            author_id: authorId,
            date: commit.date,
            message: commit.message,
            body: commit.body,
            refs: commit.refs,
            type: conventional.type,
            scope: conventional.scope,
            is_breaking_change: conventional.isBreakingChange,
        });
    }

    for (const entry of filesByCommit) {
        for (const file of entry.files) {
            fileRows.push({
                hash: entry.hash,
                path: file.path,
                status: file.status,
            });
        }
    }

    await indexCommitBatch(db, {
        authors: Array.from(authors.values()),
        commits: commitRows,
        files: fileRows,
    });

    const newest = commits[0];
    if (!newest) {
        return {
            lastIndexedHash: state.lastIndexedHash,
            lastIndexedDate: state.lastIndexedDate,
            indexedCount: 0,
        };
    }
    await setIndexState(db, {
        lastIndexedHash: newest.hash,
        lastIndexedDate: newest.date,
        schemaVersion: state.schemaVersion,
    });

    return {
        lastIndexedHash: newest.hash,
        lastIndexedDate: newest.date,
        indexedCount: commits.length,
    };
};
