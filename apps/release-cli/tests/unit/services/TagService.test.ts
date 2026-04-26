import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { TagService as TagServiceType } from '../../../src/services/TagService';

const execaMock = mock(() => Promise.resolve({ stdout: '' }));

mock.module('execa', () => ({
    execa: execaMock,
}));

const { TagService } = await import('../../../src/services/TagService');

describe('TagService', () => {
    let service: TagServiceType;

    beforeEach(() => {
        service = new TagService();
        execaMock.mockClear();
    });

    describe('createTag', () => {
        it('creates annotated tag with correct format', async () => {
            const result = await service.createTag('packages/cli-kit', '0.3.0', { dryRun: false });
            expect(result.tag).toBe('@axm-internal/cli-kit@0.3.0');
            expect(result.pushed).toBe(false);
            expect(execaMock).toHaveBeenCalledWith('git', [
                'tag',
                '-a',
                '@axm-internal/cli-kit@0.3.0',
                '-m',
                'Release @axm-internal/cli-kit@0.3.0',
            ]);
        });

        it('pushes tag when push option is true', async () => {
            const result = await service.createTag('packages/cli-kit', '0.3.0', { push: true, dryRun: false });
            expect(result.pushed).toBe(true);
            expect(execaMock).toHaveBeenCalledWith('git', ['push', 'origin', '@axm-internal/cli-kit@0.3.0']);
        });

        it('skips execution in dry-run mode', async () => {
            const result = await service.createTag('packages/cli-kit', '0.3.0', { dryRun: true });
            expect(result.tag).toBe('@axm-internal/cli-kit@0.3.0');
            expect(result.pushed).toBe(false);
            expect(execaMock).not.toHaveBeenCalled();
        });

        it('throws if tag already exists', async () => {
            execaMock.mockResolvedValueOnce({ stdout: '@axm-internal/cli-kit@0.3.0' });
            await expect(service.createTag('packages/cli-kit', '0.3.0', { dryRun: false })).rejects.toThrow(
                'already exists'
            );
        });
    });

    describe('tagExists', () => {
        it('returns true when tag is found', async () => {
            execaMock.mockResolvedValueOnce({ stdout: '@axm-internal/cli-kit@0.3.0' });
            expect(await service.tagExists('@axm-internal/cli-kit@0.3.0')).toBe(true);
        });

        it('returns false when tag is not found', async () => {
            execaMock.mockResolvedValueOnce({ stdout: '' });
            expect(await service.tagExists('@axm-internal/cli-kit@0.3.0')).toBe(false);
        });
    });
});
