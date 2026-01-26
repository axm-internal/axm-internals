import { describe, expect, it } from 'bun:test';
import { ChangeSetDraftSchema } from '../../../src/schemas/ChangeSetDraftSchema';

describe('ChangeSetDraftSchema', () => {
    it('parses a valid draft', () => {
        const parsed = ChangeSetDraftSchema.parse({
            scope: 'cli-kit',
            packagePath: 'packages/cli-kit',
            latestTagName: '@axm-internal/cli-kit@0.1.0',
            fromCommit: {
                hash: 'abc',
                author_id: 'author-1',
                date: '2026-01-01T00:00:00Z',
                message: 'feat(cli-kit): init',
                body: '',
                refs: null,
                type: 'feat',
                scope: 'cli-kit',
                is_breaking_change: false,
            },
            toCommit: {
                hash: 'def',
                author_id: 'author-1',
                date: '2026-01-02T00:00:00Z',
                message: 'fix(cli-kit): patch',
                body: '',
                refs: null,
                type: 'fix',
                scope: 'cli-kit',
                is_breaking_change: false,
            },
            commits: [],
            suggestedBump: 'minor',
            summaryLines: ['feat(cli-kit): init'],
        });

        expect(parsed.packagePath).toBe('packages/cli-kit');
    });

    it('rejects invalid drafts', () => {
        expect(() =>
            ChangeSetDraftSchema.parse({
                scope: 'cli-kit',
                packagePath: 'packages/cli-kit',
                latestTagName: null,
                fromCommit: null,
                toCommit: null,
                commits: [],
                suggestedBump: 'invalid',
                summaryLines: [],
            })
        ).toThrow();
    });
});
