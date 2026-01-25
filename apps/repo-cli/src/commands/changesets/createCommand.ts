import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { ChangeSetBuilder } from '../../services/ChangeSetBuilder';
import { ChangeSetWriter } from '../../services/ChangeSetWriter';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { listPackageApps } from '../../utils/listPackageApps';

export const changesetCreateCommand = createCommandDefinition({
    name: 'changesets:create',
    description: 'Create changeset drafts from git history (writes unless --dry).',
    argsSchema: z.object({
        packagePath: PackageAppSchema.optional().meta({
            description: 'Optional apps/<name> or packages/<name> (required unless --all).',
        }),
    }),
    optionsSchema: z.object({
        all: z.boolean().meta({ description: 'Generate drafts for all packages.' }).optional(),
        dry: z.boolean().meta({ description: 'Preview drafts without writing files.' }).optional(),
    }),
    action: async ({ container, args: { packagePath }, options }) => {
        const outputService = container.resolve(InteractiveOutputService);
        const creator = container.resolve(ChangeSetBuilder);
        const writer = container.resolve(ChangeSetWriter);

        if (options.all) {
            const drafts = await creator.createForPackagePaths(listPackageApps());
            if (!options.dry) {
                const results = await writer.writeDrafts(drafts);
                outputService.logType({
                    type: 'info',
                    message: 'Drafts written (all)',
                    obj: results,
                });
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
            const result = await writer.writeDraft(draft);
            outputService.logType({
                type: 'info',
                message: 'Draft written',
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
