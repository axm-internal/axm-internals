import { describe, expect, it } from 'bun:test';
import { readCommitFiles } from '../../../src/git/files';
import { readCommits } from '../../../src/git/log';

describe('readCommitFiles', () => {
    it('returns files for a commit hash', async () => {
        const commits = await readCommits({ limit: 10, includeMerges: false });
        expect(commits.length).toBeGreaterThan(0);

        let files: Awaited<ReturnType<typeof readCommitFiles>> = [];
        let hash = '';
        for (const commit of commits) {
            const commitFiles = await readCommitFiles({ hash: commit.hash });
            if (commitFiles.length > 0) {
                files = commitFiles;
                hash = commit.hash;
                break;
            }
        }

        expect(Array.isArray(files)).toBe(true);
        expect(files.length).toBeGreaterThan(0);

        const first = files[0];
        expect(first).toBeDefined();
        if (first) {
            expect(first.hash).toBe(hash);
            expect(first.path.length).toBeGreaterThan(0);
            expect(first.status.length).toBeGreaterThan(0);
        }
    });
});
