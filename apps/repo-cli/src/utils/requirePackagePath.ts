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
    const relativePath = path.relative(repoRoot, resolvedPath);
    const normalizedInput = packagePath.replace(/\\/g, '/');
    const segments = normalizedInput.split('/');

    if (segments.includes('..')) {
        throw new Error('Package path must stay within the repo root.');
    }

    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Package directory not found: ${resolvedPath}`);
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
        throw new Error(`Package path is not a directory: ${packagePath}`);
    }

    const topLevelDir = relativePath.split(path.sep)[0] ?? '';
    const hasTraversal = relativePath === '..' || relativePath.startsWith(`..${path.sep}`);
    if (hasTraversal || path.isAbsolute(relativePath)) {
        throw new Error('Package path must stay within the repo root.');
    }
    if (topLevelDir !== 'packages' && topLevelDir !== 'apps') {
        throw new Error('Package path must start with "packages/" or "apps/".');
    }

    return {
        packageName: packagePath,
        packageFullPath: resolvedPath,
    };
};
