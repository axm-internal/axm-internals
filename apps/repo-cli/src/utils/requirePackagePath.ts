import fs from 'node:fs';
import path from 'node:path';
import type { PackageGuardResult } from '../types';
import { findRepoRoot } from './findRepoRoot';

export const requirePackagePath = (packagePath?: string): PackageGuardResult => {
    if (!packagePath) {
        throw new Error('Usage: <script> <package-path>');
    }

    const repoRoot = findRepoRoot(process.cwd());
    const resolvedPath = path.resolve(repoRoot, packagePath);

    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Package directory not found: ${resolvedPath}`);
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
        throw new Error(`Package path is not a directory: ${packagePath}`);
    }

    if (!packagePath.startsWith('packages/') && !packagePath.startsWith('apps/')) {
        throw new Error('Package path must start with "packages/" or "apps/".');
    }

    return {
        packageName: packagePath,
        packageFullPath: resolvedPath,
    };
};
