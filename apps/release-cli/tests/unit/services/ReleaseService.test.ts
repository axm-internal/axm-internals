import { beforeEach, describe, expect, it, mock } from 'bun:test';
import type { ReleaseService as ReleaseServiceType } from '../../../src/services/ReleaseService';
import type { BumpLevel, CascadeBumpResult, VersionBumpResult } from '../../../src/types';

const execaMock = mock(() => Promise.resolve({ stdout: '' }));

mock.module('execa', () => ({
    execa: execaMock,
}));

const versionServiceMock = {
    bumpPackage: mock(
        (_packagePath: string, _bump: BumpLevel, _dryRun: boolean): VersionBumpResult => ({
            packagePath: 'packages/cli-kit',
            previousVersion: '0.3.0',
            newVersion: '0.4.0',
        })
    ),
    cascadeBump: mock(
        (_packagePath: string, _bump: BumpLevel, _dryRun: boolean): CascadeBumpResult => ({
            primary: { packagePath: 'packages/cli-kit', previousVersion: '0.3.0', newVersion: '0.4.0' },
            cascaded: [{ packagePath: 'packages/git-db', previousVersion: '1.0.0', newVersion: '1.0.1' }],
        })
    ),
};

const tagServiceMock = {
    createTag: mock(() =>
        Promise.resolve({
            tag: '@axm-internal/cli-kit@0.4.0',
            packagePath: 'packages/cli-kit',
            version: '0.4.0',
            pushed: false,
        })
    ),
};

const publishServiceMock = {
    publishPackage: mock(() =>
        Promise.resolve({ packagePath: 'packages/cli-kit', version: '0.4.0', distTag: 'latest', published: true })
    ),
};

const outputServiceMock = {
    logType: mock(() => {}),
    log: mock(() => {}),
    logWarning: mock(() => {}),
};

const { ReleaseService } = await import('../../../src/services/ReleaseService');

describe('ReleaseService', () => {
    let service: ReleaseServiceType;

    beforeEach(() => {
        service = new ReleaseService({
            versionService: versionServiceMock as never,
            tagService: tagServiceMock as never,
            publishService: publishServiceMock as never,
            outputService: outputServiceMock as never,
        });
        execaMock.mockClear();
        versionServiceMock.bumpPackage.mockClear();
        versionServiceMock.cascadeBump.mockClear();
        tagServiceMock.createTag.mockClear();
        publishServiceMock.publishPackage.mockClear();
    });

    it('runs all steps in order', async () => {
        const result = await service.release({
            packagePath: 'packages/cli-kit',
            bump: 'minor',
            dryRun: false,
        });

        expect(result.steps.map((s) => s.step)).toEqual([
            'index',
            'changelog-update',
            'changelog-write',
            'version',
            'tag',
            'commit',
            'publish',
        ]);
        expect(result.steps.every((s) => s.status === 'success')).toBe(true);
        expect(result.version).toBe('0.4.0');
    });

    it('marks all steps as dry-run when dryRun is true', async () => {
        const result = await service.release({
            packagePath: 'packages/cli-kit',
            bump: 'minor',
            dryRun: true,
        });

        expect(result.steps.every((s) => s.status === 'dry-run')).toBe(true);
        expect(execaMock).not.toHaveBeenCalled();
    });

    it('skips publish when skipPublish is true', async () => {
        const result = await service.release({
            packagePath: 'packages/cli-kit',
            bump: 'patch',
            skipPublish: true,
            dryRun: false,
        });

        const publishStep = result.steps.find((s) => s.step === 'publish');
        expect(publishStep?.status).toBe('skipped');
        expect(publishServiceMock.publishPackage).not.toHaveBeenCalled();
    });

    it('uses cascadeBump when cascade is true', async () => {
        await service.release({
            packagePath: 'packages/cli-kit',
            bump: 'minor',
            cascade: true,
            dryRun: false,
        });

        expect(versionServiceMock.cascadeBump).toHaveBeenCalled();
        expect(versionServiceMock.bumpPackage).not.toHaveBeenCalled();
    });

    it('commits with scope and version', async () => {
        await service.release({
            packagePath: 'packages/cli-kit',
            bump: 'minor',
            dryRun: false,
        });

        expect(execaMock).toHaveBeenCalledWith('git', ['commit', '-m', 'chore(release): cli-kit@0.4.0']);
    });
});
