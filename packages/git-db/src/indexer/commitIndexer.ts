import type { DbClient } from '../db/client';
import type { CommitIndexBatch, CommitIndexResult } from './types';

export const indexCommitBatch = async (_db: DbClient, _batch: CommitIndexBatch): Promise<CommitIndexResult> => {
    const authors = new Map<string, CommitIndexBatch['authors'][number]>();
    for (const author of _batch.authors) {
        authors.set(author.id, author);
    }

    const commitHashes = _batch.commits.map((commit) => commit.hash);

    await _db.transaction().execute(async (trx) => {
        if (authors.size > 0) {
            await trx
                .insertInto('authors')
                .values(Array.from(authors.values()))
                .onConflict((conflict) => conflict.column('id').doNothing())
                .execute();
        }

        if (_batch.commits.length > 0) {
            await trx
                .insertInto('commits')
                .values(_batch.commits)
                .onConflict((conflict) => conflict.column('hash').doNothing())
                .execute();
        }

        if (commitHashes.length > 0) {
            await trx.deleteFrom('commit_files').where('hash', 'in', commitHashes).execute();
        }

        if (_batch.files.length > 0) {
            await trx.insertInto('commit_files').values(_batch.files).execute();
        }
    });

    return {
        commitCount: _batch.commits.length,
        authorCount: authors.size,
        fileCount: _batch.files.length,
    };
};
