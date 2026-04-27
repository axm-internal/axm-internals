import fs from 'node:fs';
import path from 'node:path';
import { execa } from 'execa';
import type { PublishResult } from '../types';
import { listPackageApps } from '../utils/listPackageApps';

const NON_PUBLISHABLE = new Set(['tooling-config']);

export class PublishService {
    protected repoRoot: string;

    constructor(options: { repoRoot: string }) {
        this.repoRoot = options.repoRoot;
    }

    async publishPackage(packagePath: string, options: { distTag?: string; dryRun: boolean }): Promise<PublishResult> {
        const fullPath = path.join(this.repoRoot, packagePath);
        const version = this.readVersion(packagePath);

        const args = ['publish', '--access', 'public'];
        if (options.distTag) {
            args.push('--tag', options.distTag);
        }
        if (options.dryRun) {
            args.push('--dry-run');
        }

        await execa('bun', args, { cwd: fullPath });

        return {
            packagePath,
            version,
            distTag: options.distTag ?? 'latest',
            published: !options.dryRun,
        };
    }

    async publishAll(options: { distTag?: string; dryRun: boolean }): Promise<PublishResult[]> {
        const packages = listPackageApps().filter((pkg) => {
            if (!pkg.startsWith('packages/')) return false;
            const name = pkg.split('/')[1] ?? '';
            return !NON_PUBLISHABLE.has(name);
        });

        const results: PublishResult[] = [];
        for (const pkg of packages) {
            results.push(await this.publishPackage(pkg, options));
        }
        return results;
    }

    protected readVersion(packagePath: string): string {
        const filePath = path.join(this.repoRoot, packagePath, 'package.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<string, unknown>;
        return (data.version ?? '0.0.0') as string;
    }
}
