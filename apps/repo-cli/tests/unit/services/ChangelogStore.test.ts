import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ChangelogStore } from '../../../src/services/ChangelogStore';

describe('ChangelogStore', () => {
    it('writes and reads scope files', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'changelog-store-'));
        const store = new ChangelogStore({ repoRoot });
        await store.writeScope({
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
                    createdAt: new Date().toISOString(),
                },
            ],
        });

        const data = await store.readScope('cli-kit');
        expect(data.scope).toBe('cli-kit');
        expect(data.entries).toHaveLength(1);
    });

    it('writes and reads root files', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'changelog-store-'));
        const store = new ChangelogStore({ repoRoot });
        await store.writeRoot({
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
                    createdAt: new Date().toISOString(),
                },
            ],
        });

        const data = await store.readRoot();
        expect(data.entries).toHaveLength(1);
        expect(data.entries[0]?.scope).toBe('cli-kit');
    });
});
