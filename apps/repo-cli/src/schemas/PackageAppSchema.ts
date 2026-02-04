import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { findRepoRoot } from '../utils/findRepoRoot';

const listPackageDirs = (root: string, folder: 'apps' | 'packages'): string[] => {
    const basePath = path.join(root, folder);
    if (!fs.existsSync(basePath)) {
        return [];
    }
    return fs
        .readdirSync(basePath, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => `${folder}/${entry.name}`);
};

const buildValidPackageApps = (): string[] => {
    const repoRoot = findRepoRoot(process.cwd());
    return [...listPackageDirs(repoRoot, 'apps'), ...listPackageDirs(repoRoot, 'packages')].sort();
};

export const getValidPackageApps = (): string[] => {
    return buildValidPackageApps();
};

const getValidPackageAppSet = (): Set<string> => {
    return new Set<string>(buildValidPackageApps());
};

export const ValidatePackageApp = (packageApp?: string): true => {
    if (!packageApp) {
        throw new Error('Package or app name is required');
    }

    if (!getValidPackageAppSet().has(packageApp)) {
        throw new Error(`Unknown package or app "${packageApp}".`);
    }

    return true;
};

export const isValidPackageApp = (packageApp?: string): boolean => {
    return Boolean(packageApp && getValidPackageAppSet().has(packageApp));
};

export const PackageAppSchema = z.string().refine((value) => getValidPackageAppSet().has(value), {
    message: 'Expected a known "apps/<name>" or "packages/<name>" value.',
});

export type PackageApp = z.infer<typeof PackageAppSchema>;
