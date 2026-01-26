import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { ChangelogBuilder, resolvePackageTargets } from '../../services/ChangelogBuilder';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';

export const changelogWriteCommand = createCommandDefinition({
    name: 'changelog:write',
    description: 'Render markdown changelogs from .changelogs JSON.',
    argsSchema: z.object({
        packagePath: PackageAppSchema.optional().meta({
            description: 'Optional apps/<name> or packages/<name> (required unless --all).',
        }),
    }),
    optionsSchema: z.object({
        all: z.boolean().meta({ description: 'Render changelogs for all packages.' }).optional(),
    }),
    action: async ({ container, args: { packagePath }, options }) => {
        const outputService = container.resolve(InteractiveOutputService);
        const builder = container.resolve(ChangelogBuilder);
        const targets = resolvePackageTargets(packagePath, options.all);

        if (targets.length === 0) {
            throw new Error('Package path is required unless --all is provided.');
        }

        await builder.writeMarkdown(targets);
        outputService.logType({
            type: 'info',
            message: 'Changelog markdown written',
            obj: { targets },
        });
    },
});
