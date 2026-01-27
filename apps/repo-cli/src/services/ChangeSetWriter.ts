import fs from 'node:fs';
import path from 'node:path';
import { type ChangeSetDraft, ChangeSetDraftSchema } from '../schemas/ChangeSetDraftSchema';
import { findRepoRoot } from '../utils/findRepoRoot';

export interface ChangeSetWriterOptions {
    draftDir?: string;
    changesetDir?: string;
    repoRoot?: string;
}

export interface ChangeSetWriteResult {
    draft: ChangeSetDraft;
    filePath: string;
}

export interface ChangeSetFileResult {
    draft: ChangeSetDraft;
    filePath: string;
    packageName: string;
}

export class ChangeSetWriter {
    protected readonly draftDir: string;
    protected readonly changesetDir: string;
    protected readonly repoRoot: string;

    constructor(options: ChangeSetWriterOptions = {}) {
        const repoRoot = options.repoRoot ?? findRepoRoot(process.cwd());
        const draftDir = options.draftDir ?? path.join(repoRoot, '.changeset-drafts');
        const changesetDir = options.changesetDir ?? path.join(repoRoot, '.changeset');
        this.repoRoot = repoRoot;
        this.draftDir = draftDir;
        this.changesetDir = changesetDir;
    }

    async writeDraft(input: ChangeSetDraft): Promise<ChangeSetWriteResult> {
        const draft = ChangeSetDraftSchema.parse(input);
        const filePath = path.join(this.draftDir, this.buildFileName(draft));
        this.ensureDraftDir();
        await Bun.write(Bun.file(filePath), `${JSON.stringify(draft, null, 2)}\n`);
        return { draft, filePath };
    }

    async writeDrafts(inputs: ChangeSetDraft[]): Promise<ChangeSetWriteResult[]> {
        const results: ChangeSetWriteResult[] = [];
        for (const draft of inputs) {
            results.push(await this.writeDraft(draft));
        }
        return results;
    }

    async writeChangeset(input: ChangeSetDraft): Promise<ChangeSetFileResult> {
        const draft = ChangeSetDraftSchema.parse(input);
        const packageName = await this.readPackageName(draft.packagePath);
        const filePath = path.join(this.changesetDir, this.buildChangesetFileName(draft));
        this.ensureDir(this.changesetDir);
        const content = this.buildChangesetContent(draft, packageName);
        await Bun.write(Bun.file(filePath), content);
        return { draft, filePath, packageName };
    }

    async writeChangesets(inputs: ChangeSetDraft[]): Promise<ChangeSetFileResult[]> {
        const results: ChangeSetFileResult[] = [];
        for (const draft of inputs) {
            results.push(await this.writeChangeset(draft));
        }
        return results;
    }

    protected ensureDraftDir(): void {
        this.ensureDir(this.draftDir);
    }

    protected ensureDir(dirPath: string): void {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }

    protected buildFileName(draft: ChangeSetDraft): string {
        const scopeSlug = draft.scope.replace(/[^a-z0-9-_]/gi, '_');
        const fromHash = draft.fromCommit?.hash?.slice(0, 7) ?? 'none';
        const toHash = draft.toCommit?.hash?.slice(0, 7) ?? 'none';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${scopeSlug}-${fromHash}-${toHash}-${timestamp}.json`;
    }

    protected buildChangesetFileName(draft: ChangeSetDraft): string {
        const scopeSlug = draft.scope.replace(/[^a-z0-9-_]/gi, '_');
        const fromHash = draft.fromCommit?.hash?.slice(0, 7) ?? 'none';
        const toHash = draft.toCommit?.hash?.slice(0, 7) ?? 'none';
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        return `${scopeSlug}-${fromHash}-${toHash}-${timestamp}.md`;
    }

    protected buildChangesetContent(draft: ChangeSetDraft, packageName: string): string {
        const bump = draft.suggestedBump ?? 'none';
        const summaryLines = draft.summaryLines.length
            ? draft.summaryLines.map((line) => `- ${line}`).join('\n')
            : '- No user-facing changes.';
        return `---\n"${packageName}": ${bump}\n---\n\n${summaryLines}\n`;
    }

    protected async readPackageName(packagePath: string): Promise<string> {
        const packageJsonPath = path.join(this.repoRoot, packagePath, 'package.json');
        const file = Bun.file(packageJsonPath);
        if (!(await file.exists())) {
            throw new Error(`package.json not found at ${packageJsonPath}`);
        }
        const json = (await file.json()) as { name?: string };
        if (!json.name) {
            throw new Error(`package.json missing name at ${packageJsonPath}`);
        }
        return json.name;
    }
}
