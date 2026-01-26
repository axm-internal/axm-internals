import { describe, expect, it } from 'bun:test';
import { RootChangelogSchema, ScopeChangelogSchema } from '../../../src/schemas/ChangelogJsonSchema';

describe('ChangelogJsonSchema', () => {
    it('parses scope changelog entries', () => {
        const parsed = ScopeChangelogSchema.parse({
            scope: 'cli-kit',
            entries: [
                {
                    version: '0.1.0',
                    tag: '@axm-internal/cli-kit@0.1.0',
                    fromHash: 'abc',
                    toHash: 'def',
                    rangeStartDate: '2026-01-01T00:00:00Z',
                    rangeEndDate: '2026-01-02T00:00:00Z',
                    summaryLines: ['feat(cli-kit): init'],
                    createdAt: '2026-01-01T00:00:00Z',
                },
            ],
        });

        expect(parsed.entries).toHaveLength(1);
    });

    it('parses root changelog entries', () => {
        const parsed = RootChangelogSchema.parse({
            entries: [
                {
                    scope: 'cli-kit',
                    version: '0.1.0',
                    tag: '@axm-internal/cli-kit@0.1.0',
                    fromHash: 'abc',
                    toHash: 'def',
                    rangeStartDate: '2026-01-01T00:00:00Z',
                    rangeEndDate: '2026-01-02T00:00:00Z',
                    summaryLines: ['feat(cli-kit): init'],
                    createdAt: '2026-01-01T00:00:00Z',
                },
            ],
        });

        expect(parsed.entries[0]?.scope).toBe('cli-kit');
    });
});
