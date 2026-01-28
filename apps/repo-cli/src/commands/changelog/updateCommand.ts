import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { ChangelogBuilder, resolvePackageTargets } from '../../services/ChangelogBuilder';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';

export const changelogUpdateCommand = createCommandDefinition({
    name: 'changelog:update',
    description: 'Append new entries to .changelogs JSON based on git-db.',
    argsSchema: z.object({
        packagePath: PackageAppSchema.optional().meta({
            description: 'Optional apps/<name> or packages/<name> (required unless --all).',
        }),
    }),
    optionsSchema: z.object({
        all: z.boolean().meta({ description: 'Update all packages.' }).optional(),
        dry: z.boolean().meta({ description: 'Report without writing.' }).optional(),
    }),
    action: async ({ container, args: { packagePath }, options }) => {
        const outputService = container.resolve(InteractiveOutputService);
        const builder = container.resolve(ChangelogBuilder);
        const targets = resolvePackageTargets(packagePath, options.all);

        if (targets.length === 0) {
            throw new Error('Package path is required unless --all is provided.');
        }

        const report = await builder.reportUpdate(targets);

        outputService.logType({
            type: 'info',
            message: options.dry ? 'Update report (preview)' : 'Update report',
            obj: report,
        });

        if (options.dry) {
            return;
        }

        const applied = await builder.update(targets);

        outputService.logType({
            type: 'info',
            message: 'Update applied',
            obj: applied,
        });
    },
});
