import { execa } from 'execa';
import type { BumpLevel, ReleaseResult, ReleaseStep } from '../types';
import { splitPackageApp } from '../utils/splitPackageApp';
import type { InteractiveOutputService } from './InteractiveOutputService';
import type { PublishService } from './PublishService';
import type { TagService } from './TagService';
import type { VersionService } from './VersionService';

const REPO_CLI_PATH = 'apps/repo-cli/src/cli.ts';

type StepStatus = 'skipped' | 'success' | 'dry-run';

export class ReleaseService {
    protected versionService: VersionService;
    protected tagService: TagService;
    protected publishService: PublishService;
    protected outputService: InteractiveOutputService;

    constructor(services: {
        versionService: VersionService;
        tagService: TagService;
        publishService: PublishService;
        outputService: InteractiveOutputService;
    }) {
        this.versionService = services.versionService;
        this.tagService = services.tagService;
        this.publishService = services.publishService;
        this.outputService = services.outputService;
    }

    async release(params: {
        packagePath: string;
        bump: BumpLevel;
        cascade?: boolean;
        pushTag?: boolean;
        skipPublish?: boolean;
        distTag?: string;
        dryRun: boolean;
    }): Promise<ReleaseResult> {
        const steps: Array<{ step: ReleaseStep; status: StepStatus }> = [];
        const { packagePath, bump, dryRun } = params;

        const stepStatus = (status: StepStatus) => (dryRun ? 'dry-run' : status);

        // 1. Index
        await this.runStep('index', steps, dryRun, () => execa('bun', ['run', REPO_CLI_PATH, 'gitdb:index']));

        // 2. Changelog update
        await this.runStep('changelog-update', steps, dryRun, () =>
            execa('bun', ['run', REPO_CLI_PATH, 'changelog:update', packagePath])
        );

        // 3. Changelog write
        await this.runStep('changelog-write', steps, dryRun, () =>
            execa('bun', ['run', REPO_CLI_PATH, 'changelog:write', packagePath])
        );

        // 4. Version bump
        let newVersion: string;
        if (params.cascade) {
            const result = this.versionService.cascadeBump(packagePath, bump, dryRun);
            newVersion = result.primary.newVersion;
        } else {
            const result = this.versionService.bumpPackage(packagePath, bump, dryRun);
            newVersion = result.newVersion;
        }
        steps.push({ step: 'version', status: stepStatus('success') });

        // 5. Commit
        if (!dryRun) {
            const [, scope] = splitPackageApp(packagePath);
            await execa('git', ['add', packagePath]);
            await execa('git', ['commit', '-m', `chore(release): ${scope}@${newVersion}`]);
        }
        steps.push({ step: 'commit', status: stepStatus('success') });

        // 6. Tag
        await this.tagService.createTag(packagePath, newVersion, {
            push: params.pushTag,
            dryRun,
        });
        steps.push({ step: 'tag', status: stepStatus('success') });

        // 7. Publish
        if (params.skipPublish) {
            steps.push({ step: 'publish', status: 'skipped' });
        } else {
            await this.publishService.publishPackage(packagePath, {
                distTag: params.distTag,
                dryRun,
            });
            steps.push({ step: 'publish', status: stepStatus('success') });
        }

        return { packagePath, bump, steps, version: newVersion };
    }

    protected async runStep(
        step: ReleaseStep,
        steps: Array<{ step: ReleaseStep; status: StepStatus }>,
        dryRun: boolean,
        fn: () => Promise<unknown>
    ): Promise<void> {
        if (dryRun) {
            steps.push({ step, status: 'dry-run' });
            return;
        }
        await fn();
        steps.push({ step, status: 'success' });
    }
}
