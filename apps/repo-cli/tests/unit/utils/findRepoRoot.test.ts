import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findRepoRoot } from '../../../src/utils/findRepoRoot';

describe('findRepoRoot', () => {
    it('returns a directory containing .git when starting below the repo root', () => {
        const start = path.join(process.cwd(), 'src');
        const repoRoot = findRepoRoot(start);
        expect(fs.existsSync(path.join(repoRoot, '.git'))).toBeTrue();
    });

    it('returns the start dir when no .git is found', () => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'repo-cli-'));
        const repoRoot = findRepoRoot(tempDir);
        expect(repoRoot).toBe(tempDir);
    });
});
