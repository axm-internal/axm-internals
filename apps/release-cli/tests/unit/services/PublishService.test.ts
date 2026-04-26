import { beforeEach, describe, expect, it, mock } from 'bun:test';
import path from 'node:path';
import type { PublishService as PublishServiceType } from '../../../src/services/PublishService';

const FAKE_ROOT = '/fake/repo';
const FAKE_PACKAGES: Record<string, Record<string, unknown>> = {};

const fakeFs = {
    readFileSync: (filePath: string, _encoding: string) => {
        const rel = path.relative(FAKE_ROOT, filePath);
        if (FAKE_PACKAGES[rel]) return JSON.stringify(FAKE_PACKAGES[rel]);
        throw new Error(`ENOENT: ${filePath}`);
    },
    writeFileSync: () => {},
    existsSync: () => true,
    readdirSync: () => [],
};

mock.module('node:fs', () => ({
    ...fakeFs,
    default: fakeFs,
}));

const execaMock = mock(() => Promise.resolve({ stdout: '' }));

mock.module('execa', () => ({
    execa: execaMock,
}));

mock.module('../../../src/utils/listPackageApps', () => ({
    listPackageApps: () =>
        Object.keys(FAKE_PACKAGES)
            .filter((p) => p.endsWith('package.json'))
            .map((p) => p.replace('/package.json', '')),
}));

const { PublishService } = await import('../../../src/services/PublishService');

describe('PublishService', () => {
    let service: PublishServiceType;

    beforeEach(() => {
        service = new PublishService({ repoRoot: FAKE_ROOT });
        execaMock.mockClear();
        for (const key of Object.keys(FAKE_PACKAGES)) {
            delete FAKE_PACKAGES[key];
        }
    });

    describe('publishPackage', () => {
        it('publishes with --access public', async () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { version: '0.3.0' };
            const result = await service.publishPackage('packages/cli-kit', { dryRun: false });
            expect(result.published).toBe(true);
            expect(result.version).toBe('0.3.0');
            expect(execaMock).toHaveBeenCalledWith('bun', ['publish', '--access', 'public'], {
                cwd: path.join(FAKE_ROOT, 'packages/cli-kit'),
            });
        });

        it('adds --tag for dist-tag', async () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { version: '0.3.0' };
            const result = await service.publishPackage('packages/cli-kit', { distTag: 'next', dryRun: false });
            expect(result.distTag).toBe('next');
            expect(execaMock).toHaveBeenCalledWith('bun', ['publish', '--access', 'public', '--tag', 'next'], {
                cwd: path.join(FAKE_ROOT, 'packages/cli-kit'),
            });
        });

        it('adds --dry-run flag', async () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { version: '0.3.0' };
            const result = await service.publishPackage('packages/cli-kit', { dryRun: true });
            expect(result.published).toBe(false);
            expect(execaMock).toHaveBeenCalledWith('bun', ['publish', '--access', 'public', '--dry-run'], {
                cwd: path.join(FAKE_ROOT, 'packages/cli-kit'),
            });
        });
    });

    describe('publishAll', () => {
        it('publishes all packages except tooling-config and apps', async () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { version: '0.3.0' };
            FAKE_PACKAGES['packages/git-db/package.json'] = { version: '1.0.0' };
            FAKE_PACKAGES['packages/tooling-config/package.json'] = { version: '0.0.1' };
            FAKE_PACKAGES['apps/repo-cli/package.json'] = { version: '0.2.0' };

            const results = await service.publishAll({ dryRun: false });
            const paths = results.map((r) => r.packagePath);
            expect(paths).toContain('packages/cli-kit');
            expect(paths).toContain('packages/git-db');
            expect(paths).not.toContain('packages/tooling-config');
            expect(paths).not.toContain('apps/repo-cli');
        });
    });
});
