import fs from 'node:fs';
import path from 'node:path';
import type { BumpLevel, CascadeBumpResult, VersionBumpResult } from '../types';
import { listPackageApps } from '../utils/listPackageApps';
import { splitPackageApp } from '../utils/splitPackageApp';

export class VersionService {
    protected repoRoot: string;

    constructor(options: { repoRoot: string }) {
        this.repoRoot = options.repoRoot;
    }

    readCurrentVersion(packagePath: string): string {
        const filePath = path.join(this.repoRoot, packagePath, 'package.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
        const version = data.version;
        if (typeof version !== 'string') {
            throw new Error(`No "version" field found in ${filePath}`);
        }
        return version;
    }

    bumpVersion(currentVersion: string, bump: BumpLevel): string {
        const parts = currentVersion.split('.').map(Number);
        if (parts.length !== 3 || parts.some(Number.isNaN)) {
            throw new Error(`Invalid semver version: "${currentVersion}"`);
        }

        const major = parts[0] as number;
        const minor = parts[1] as number;
        const patch = parts[2] as number;
        switch (bump) {
            case 'major':
                return `${major + 1}.0.0`;
            case 'minor':
                return `${major}.${minor + 1}.0`;
            case 'patch':
                return `${major}.${minor}.${patch + 1}`;
        }
    }

    bumpPackage(packagePath: string, bump: BumpLevel, dryRun: boolean): VersionBumpResult {
        const previousVersion = this.readCurrentVersion(packagePath);
        const newVersion = this.bumpVersion(previousVersion, bump);

        if (!dryRun) {
            this.writeVersion(packagePath, newVersion);
        }

        return { packagePath, previousVersion, newVersion };
    }

    cascadeBump(packagePath: string, bump: BumpLevel, dryRun: boolean): CascadeBumpResult {
        const primary = this.bumpPackage(packagePath, bump, dryRun);

        const [, scope] = splitPackageApp(packagePath);
        const npmName = `@axm-internal/${scope}`;

        const allPackages = listPackageApps().filter((p) => p !== packagePath);
        const cascaded: VersionBumpResult[] = [];

        for (const pkg of allPackages) {
            const filePath = path.join(this.repoRoot, pkg, 'package.json');
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
            const deps = data.dependencies as Record<string, string> | undefined;
            const devDeps = data.devDependencies as Record<string, string> | undefined;

            if (deps?.[npmName] !== undefined || devDeps?.[npmName] !== undefined) {
                cascaded.push(this.bumpPackage(pkg, 'patch', dryRun));
            }
        }

        return { primary, cascaded };
    }

    protected writeVersion(packagePath: string, newVersion: string): void {
        const filePath = path.join(this.repoRoot, packagePath, 'package.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
        data.version = newVersion;
        fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
    }
}
