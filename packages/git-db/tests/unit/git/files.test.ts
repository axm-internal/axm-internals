import { describe, expect, it } from 'bun:test';
import { execa } from 'execa';
import { readCommitFiles } from '../../../src/git/files';

describe('readCommitFiles', () => {
    it('returns files for a commit hash', async () => {
        const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
        const hash = stdout.trim();

        const files = await readCommitFiles({ hash });
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
