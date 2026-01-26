import { describe, expect, it } from 'bun:test';
import { CommitSchema } from '../../../src/schemas/CommitSchema';

describe('CommitSchema', () => {
    it('parses a valid commit', () => {
        const parsed = CommitSchema.parse({
            hash: 'abc123',
            author_id: 'author-1',
            date: '2026-01-01T00:00:00Z',
            message: 'feat(cli-kit): added thing',
            body: '',
            refs: null,
            type: 'feat',
            scope: 'cli-kit',
            is_breaking_change: false,
        });

        expect(parsed.hash).toBe('abc123');
    });

    it('rejects invalid commits', () => {
        expect(() =>
            CommitSchema.parse({
                author_id: 'author-1',
                date: '2026-01-01T00:00:00Z',
                message: 'feat(cli-kit): added thing',
                body: '',
                refs: null,
                type: 'feat',
                scope: 'cli-kit',
                is_breaking_change: false,
            })
        ).toThrow();
    });
});
