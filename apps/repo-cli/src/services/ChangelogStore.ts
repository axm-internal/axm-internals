import fs from 'node:fs';
import path from 'node:path';
import {
    type RootChangelog,
    RootChangelogSchema,
    type ScopeChangelog,
    ScopeChangelogSchema,
} from '../schemas/ChangelogJsonSchema';
import { findRepoRoot } from '../utils/findRepoRoot';

export interface ChangelogStoreOptions {
    repoRoot?: string;
}

export class ChangelogStore {
    protected readonly repoRoot: string;
    protected readonly changelogDir: string;

    constructor(options: ChangelogStoreOptions = {}) {
        this.repoRoot = options.repoRoot ?? findRepoRoot(process.cwd());
        this.changelogDir = path.join(this.repoRoot, '.changelogs');
    }

    async ensureDir(): Promise<void> {
        await fs.promises.mkdir(this.changelogDir, { recursive: true });
    }

    async readScope(scope: string): Promise<ScopeChangelog> {
        const filePath = this.scopePath(scope);
        const file = Bun.file(filePath);
        if (!(await file.exists())) {
            return { scope, entries: [] };
        }
        const data = await file.json();
        return ScopeChangelogSchema.parse(data);
    }

    async writeScope(data: ScopeChangelog): Promise<void> {
        const parsed = ScopeChangelogSchema.parse(data);
        await this.ensureDir();
        const file = Bun.file(this.scopePath(parsed.scope));
        await Bun.write(file, `${JSON.stringify(parsed, null, 2)}\n`);
    }

    async readRoot(): Promise<RootChangelog> {
        const filePath = this.rootPath();
        const file = Bun.file(filePath);
        if (!(await file.exists())) {
            return { entries: [] };
        }
        const data = await file.json();
        return RootChangelogSchema.parse(data);
    }

    async writeRoot(data: RootChangelog): Promise<void> {
        const parsed = RootChangelogSchema.parse(data);
        await this.ensureDir();
        const file = Bun.file(this.rootPath());
        await Bun.write(file, `${JSON.stringify(parsed, null, 2)}\n`);
    }

    rootPath(): string {
        return path.join(this.changelogDir, 'root.json');
    }

    scopePath(scope: string): string {
        const safeScope = scope.replace(/[^a-z0-9-_]/gi, '_');
        return path.join(this.changelogDir, `${safeScope}.json`);
    }
}
