import { describe, expect, it } from 'bun:test';
import { readCommits } from '../../../src/git/log';

describe('readCommits', () => {
    it('returns commits in a structured format', async () => {
        const commits = await readCommits({ limit: 3 });
        expect(Array.isArray(commits)).toBe(true);
        expect(commits.length).toBeGreaterThan(0);

        const first = commits[0];
        expect(first).toBeDefined();
        if (first) {
            expect(first.hash.length).toBeGreaterThan(0);
            expect(first.authorName.length).toBeGreaterThan(0);
            expect(first.authorEmail.length).toBeGreaterThan(0);
            expect(first.date.length).toBeGreaterThan(0);
            expect(first.message.length).toBeGreaterThan(0);
        }
    });

    it('skips merge commits by default', async () => {
        const [defaultCommits, explicitNoMerges] = await Promise.all([
            readCommits({ limit: 50 }),
            readCommits({ includeMerges: false, limit: 50 }),
        ]);
        expect(defaultCommits).toEqual(explicitNoMerges);
    });

    it('includes merge commits when enabled', async () => {
        const [withoutMerges, withMerges] = await Promise.all([
            readCommits({ limit: 50 }),
            readCommits({ includeMerges: true, limit: 50 }),
        ]);
        expect(withMerges.length).toBeGreaterThanOrEqual(withoutMerges.length);
    });
});
