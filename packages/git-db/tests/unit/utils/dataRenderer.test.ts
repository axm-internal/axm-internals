import { describe, expect, it } from 'bun:test';
import type { Author, Commit, CommitFile, MetaEntry } from '../../../src';
import { renderAuthors, renderCommits, renderFiles, renderMeta } from '../../../src/utils/dataRenderer';

describe('data renderers', () => {
    it('renders authors table', () => {
        const authors: Author[] = [{ id: 'alice@example.com', name: 'Alice', email: 'alice@example.com' }];
        const output = renderAuthors(authors);
        expect(output).toContain('Identifier');
        expect(output).toContain('Alice');
        expect(output).toContain('alice@example.com');
    });

    it('renders commits table', () => {
        const commits: Commit[] = [
            {
                hash: 'abcdef1234567890',
                author_id: 'alice@example.com',
                date: '2026-01-01T00:00:00.000Z',
                message: 'feat: hello',
                body: '',
                refs: 'origin/main',
                type: 'feat',
                scope: 'git-db',
                is_breaking_change: true,
            },
        ];
        const output = renderCommits(commits);
        expect(output).toContain('Hash');
        expect(output).toContain('Type');
        expect(output).toContain('Scope');
        expect(output).toContain('Breaking');
        expect(output).toContain('abcdef1234567890'.slice(0, 16));
        expect(output).toContain('feat: hello');
    });

    it('renders files table', () => {
        const files: CommitFile[] = [{ hash: 'abc', path: 'packages/git-db/src/index.ts', status: 'A' }];
        const output = renderFiles(files);
        expect(output).toContain('Path');
        expect(output).toContain('packages/git-db/src/index.ts');
    });

    it('renders meta table', () => {
        const meta: MetaEntry[] = [{ key: 'schema_version', value: '1' }];
        const output = renderMeta(meta);
        expect(output).toContain('schema_version');
        expect(output).toContain('1');
    });
});
