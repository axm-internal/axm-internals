import { execa } from 'execa';
import type { TagResult } from '../types';
import { splitPackageApp } from '../utils/splitPackageApp';

export class TagService {
    async createTag(
        packagePath: string,
        version: string,
        options: { push?: boolean; dryRun: boolean }
    ): Promise<TagResult> {
        const [, scope] = splitPackageApp(packagePath);
        const tag = `@axm-internal/${scope}@${version}`;

        if (options.dryRun) {
            return { tag, packagePath, version, pushed: false };
        }

        if (await this.tagExists(tag)) {
            throw new Error(`Tag "${tag}" already exists.`);
        }

        await execa('git', ['tag', '-a', tag, '-m', `Release ${tag}`]);

        if (options.push) {
            await execa('git', ['push', 'origin', tag]);
        }

        return { tag, packagePath, version, pushed: options.push ?? false };
    }

    async tagExists(tag: string): Promise<boolean> {
        const result = await execa('git', ['tag', '-l', tag]);
        return result.stdout.trim() === tag;
    }
}
