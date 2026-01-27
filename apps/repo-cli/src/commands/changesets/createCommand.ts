import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { ChangeSetBuilder } from '../../services/ChangeSetBuilder';
import { ChangeSetWriter } from '../../services/ChangeSetWriter';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { listPackageApps } from '../../utils/listPackageApps';

export const changesetCreateCommand = createCommandDefinition({
    name: 'changesets:create',
    description: 'Create changesets from git history (writes unless --dry).',
    argsSchema: z.object({
        packagePath: PackageAppSchema.optional().meta({
            description: 'Optional apps/<name> or packages/<name> (required unless --all).',
        }),
    }),
    optionsSchema: z.object({
        all: z.boolean().meta({ description: 'Generate changesets for all packages.' }).optional(),
        dry: z.boolean().meta({ description: 'Preview changesets without writing files.' }).optional(),
    }),
    action: async ({ container, args: { packagePath }, options }) => {
        const outputService = container.resolve(InteractiveOutputService);
        const creator = container.resolve(ChangeSetBuilder);
        const writer = container.resolve(ChangeSetWriter);

        if (options.all) {
            const drafts = await creator.createForPackagePaths(listPackageApps());
            const withCommits = drafts.filter((draft) => draft.commits.length > 0);
            const skipped = drafts.length - withCommits.length;
            if (!options.dry) {
                const results = await writer.writeChangesets(withCommits);
                outputService.logType({
                    type: 'info',
                    message: 'Changesets written (all)',
                    obj: results,
                });
                if (skipped > 0) {
                    outputService.logType({
                        type: 'info',
                        message: `Skipped ${skipped} package(s) with no commits after the latest tag.`,
                    });
                }
                return;
            }
            outputService.logType({
                type: 'info',
                message: 'Draft preview (all)',
                obj: drafts,
            });
            return;
        }

        if (!packagePath) {
            throw new Error('Package path is required unless --all is provided.');
        }

        const draft = await creator.createForPackagePath(packagePath);

        if (!options.dry) {
            if (draft.commits.length === 0) {
                outputService.logType({
                    type: 'info',
                    message: 'No commits found after the latest tag. Skipping changeset.',
                });
                return;
            }
            const result = await writer.writeChangeset(draft);
            outputService.logType({
                type: 'info',
                message: 'Changeset written',
                obj: result,
            });
            return;
        }

        outputService.logType({
            type: 'info',
            message: 'Draft preview',
            obj: draft,
        });
    },
});
