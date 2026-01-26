import { z } from 'zod';

const validPackageApps = [
    'apps/repo-cli',
    'packages/cli-kit',
    'packages/config-schema',
    'packages/git-db',
    'packages/tooling-config',
    'packages/zod-helpers',
] as const;

const validPackageAppSet = new Set<string>(validPackageApps);

export const ValidatePackageApp = (packageApp?: string): true => {
    if (!packageApp) {
        throw new Error('Package or app name is required');
    }

    if (!validPackageAppSet.has(packageApp)) {
        throw new Error(`Unknown package or app "${packageApp}".`);
    }

    return true;
};

export const isValidPackageApp = (packageApp?: string): boolean => {
    return Boolean(packageApp && validPackageAppSet.has(packageApp));
};

export const PackageAppSchema = z.enum(validPackageApps, {
    error: () => 'Expected a known "apps/<name>" or "packages/<name>" value.',
});

export type PackageApp = z.infer<typeof PackageAppSchema>;
