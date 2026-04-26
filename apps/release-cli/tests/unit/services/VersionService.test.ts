import { beforeEach, describe, expect, it, mock } from 'bun:test';
import path from 'node:path';
import type { VersionService as VersionServiceType } from '../../../src/services/VersionService';

const FAKE_ROOT = '/fake/repo';
const FAKE_PACKAGES: Record<string, Record<string, unknown>> = {};

const fakeFs = {
    readFileSync: (filePath: string, _encoding: string) => {
        const rel = path.relative(FAKE_ROOT, filePath);
        if (FAKE_PACKAGES[rel]) return JSON.stringify(FAKE_PACKAGES[rel]);
        throw new Error(`ENOENT: ${filePath}`);
    },
    writeFileSync: (filePath: string, content: string) => {
        const rel = path.relative(FAKE_ROOT, filePath);
        FAKE_PACKAGES[rel] = JSON.parse(content) as Record<string, unknown>;
    },
    existsSync: () => true,
    readdirSync: () => [],
};

mock.module('node:fs', () => ({
    ...fakeFs,
    default: fakeFs,
}));

mock.module('../../../src/utils/listPackageApps', () => ({
    listPackageApps: () =>
        Object.keys(FAKE_PACKAGES)
            .filter((p) => p.endsWith('package.json'))
            .map((p) => p.replace('/package.json', '')),
}));

const { VersionService } = await import('../../../src/services/VersionService');

describe('VersionService', () => {
    let service: VersionServiceType;

    beforeEach(() => {
        service = new VersionService({ repoRoot: FAKE_ROOT });
        for (const key of Object.keys(FAKE_PACKAGES)) {
            delete FAKE_PACKAGES[key];
        }
    });

    describe('bumpVersion', () => {
        it('bumps patch', () => {
            expect(service.bumpVersion('1.2.3', 'patch')).toBe('1.2.4');
        });

        it('bumps minor', () => {
            expect(service.bumpVersion('1.2.3', 'minor')).toBe('1.3.0');
        });

        it('bumps major', () => {
            expect(service.bumpVersion('1.2.3', 'major')).toBe('2.0.0');
        });

        it('rejects invalid semver', () => {
            expect(() => service.bumpVersion('1.2', 'patch')).toThrow('Invalid semver version');
        });

        it('rejects non-numeric parts', () => {
            expect(() => service.bumpVersion('1.a.3', 'patch')).toThrow('Invalid semver version');
        });
    });

    describe('readCurrentVersion', () => {
        it('reads version from package.json', () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { version: '0.3.0' };
            expect(service.readCurrentVersion('packages/cli-kit')).toBe('0.3.0');
        });

        it('throws when version field missing', () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { name: 'test' };
            expect(() => service.readCurrentVersion('packages/cli-kit')).toThrow('No "version" field');
        });
    });

    describe('bumpPackage', () => {
        it('bumps and writes package.json', () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { version: '0.3.0' };
            const result = service.bumpPackage('packages/cli-kit', 'patch', false);
            expect(result.previousVersion).toBe('0.3.0');
            expect(result.newVersion).toBe('0.3.1');
            expect(FAKE_PACKAGES['packages/cli-kit/package.json'].version).toBe('0.3.1');
        });

        it('skips write in dry-run', () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { version: '0.3.0' };
            const result = service.bumpPackage('packages/cli-kit', 'minor', true);
            expect(result.newVersion).toBe('0.4.0');
            expect(FAKE_PACKAGES['packages/cli-kit/package.json'].version).toBe('0.3.0');
        });
    });

    describe('cascadeBump', () => {
        it('bumps primary and cascades to dependents', () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { version: '1.0.0' };
            FAKE_PACKAGES['packages/git-db/package.json'] = {
                version: '2.0.0',
                dependencies: { '@axm-internal/cli-kit': '^1.0.0' },
            };
            FAKE_PACKAGES['packages/config-schema/package.json'] = {
                version: '3.0.0',
                devDependencies: { '@axm-internal/cli-kit': '^1.0.0' },
            };
            FAKE_PACKAGES['packages/unrelated/package.json'] = {
                version: '4.0.0',
                dependencies: { '@axm-internal/other': '^1.0.0' },
            };

            const result = service.cascadeBump('packages/cli-kit', 'minor', false);
            expect(result.primary.newVersion).toBe('1.1.0');
            expect(result.cascaded).toHaveLength(2);
            expect(result.cascaded.map((c) => c.packagePath)).toEqual(
                expect.arrayContaining(['packages/git-db', 'packages/config-schema'])
            );
            expect(
                result.cascaded.every((c) => c.newVersion.startsWith('2.0.1') || c.newVersion.startsWith('3.0.1'))
            ).toBe(true);
        });

        it('skips cascade writes in dry-run', () => {
            FAKE_PACKAGES['packages/cli-kit/package.json'] = { version: '1.0.0' };
            FAKE_PACKAGES['packages/git-db/package.json'] = {
                version: '2.0.0',
                dependencies: { '@axm-internal/cli-kit': '^1.0.0' },
            };

            const result = service.cascadeBump('packages/cli-kit', 'major', true);
            expect(result.primary.newVersion).toBe('2.0.0');
            expect(FAKE_PACKAGES['packages/cli-kit/package.json'].version).toBe('1.0.0');
            expect(FAKE_PACKAGES['packages/git-db/package.json'].version).toBe('2.0.0');
        });
    });
});
