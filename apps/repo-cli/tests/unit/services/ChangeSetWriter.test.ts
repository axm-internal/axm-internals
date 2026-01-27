import { describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { ChangeSetDraft } from '../../../src/schemas/ChangeSetDraftSchema';
import { ChangeSetWriter } from '../../../src/services/ChangeSetWriter';

const buildDraft = (overrides: Partial<ChangeSetDraft> = {}): ChangeSetDraft => ({
    scope: 'cli-kit',
    packagePath: 'packages/cli-kit',
    latestTagName: null,
    fromCommit: null,
    toCommit: null,
    commits: [],
    suggestedBump: null,
    summaryLines: [],
    ...overrides,
});

describe('ChangeSetWriter', () => {
    it('writes draft files under the draft directory', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'changeset-writer-'));
        const writer = new ChangeSetWriter({ repoRoot });
        const draft = buildDraft({
            toCommit: {
                hash: 'abc123def456',
                author_id: 'author-1',
                date: '2026-01-25T00:00:00Z',
                message: 'feat(cli-kit): added draft writer',
                body: '',
                refs: null,
                type: 'feat',
                scope: 'cli-kit',
                is_breaking_change: false,
            },
        });

        const result = await writer.writeDraft(draft);
        const expectedDir = path.join(repoRoot, '.changeset-drafts');

        expect(result.filePath.startsWith(expectedDir)).toBe(true);
        const file = Bun.file(result.filePath);
        expect(await file.exists()).toBe(true);

        const parsed = (await file.json()) as ChangeSetDraft;
        expect(parsed.scope).toBe('cli-kit');
        expect(parsed.toCommit?.hash).toBe('abc123def456');
    });

    it('writes multiple drafts', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'changeset-writer-'));
        const writer = new ChangeSetWriter({ repoRoot });
        const drafts = [buildDraft(), buildDraft({ scope: 'repo-cli', packagePath: 'apps/repo-cli' })];

        const results = await writer.writeDrafts(drafts);

        expect(results).toHaveLength(2);
        for (const result of results) {
            const file = Bun.file(result.filePath);
            expect(await file.exists()).toBe(true);
        }
    });

    it('writes changeset markdown files', async () => {
        const repoRoot = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'changeset-writer-'));
        const packagePath = path.join(repoRoot, 'packages/cli-kit');
        await fs.promises.mkdir(packagePath, { recursive: true });
        await fs.promises.writeFile(
            path.join(packagePath, 'package.json'),
            JSON.stringify({ name: '@axm-internal/cli-kit' }, null, 2)
        );

        const writer = new ChangeSetWriter({ repoRoot });
        const draft = buildDraft({
            packagePath: 'packages/cli-kit',
            summaryLines: ['feat(cli-kit): added thing'],
            suggestedBump: 'minor',
        });

        const result = await writer.writeChangeset(draft);
        const file = Bun.file(result.filePath);

        expect(result.filePath.startsWith(path.join(repoRoot, '.changeset'))).toBe(true);
        expect(await file.exists()).toBe(true);
        const content = await file.text();
        expect(content).toContain('"@axm-internal/cli-kit": minor');
        expect(content).toContain('- feat(cli-kit): added thing');
    });
});
