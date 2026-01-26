import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { ChangelogBuilder, resolvePackageTargets } from '../../services/ChangelogBuilder';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';

export const changelogReportCommand = createCommandDefinition({
    name: 'changelog:report',
    description: 'Report changelog JSON coverage and missing entries.',
    argsSchema: z.object({
        packagePath: PackageAppSchema.optional().meta({
            description: 'Optional apps/<name> or packages/<name> (required unless --all).',
        }),
    }),
    optionsSchema: z.object({
        all: z.boolean().meta({ description: 'Report on all packages.' }).optional(),
    }),
    action: async ({ container, args: { packagePath }, options }) => {
        const outputService = container.resolve(InteractiveOutputService);
        const builder = container.resolve(ChangelogBuilder);
        const targets = resolvePackageTargets(packagePath, options.all);

        if (targets.length === 0) {
            throw new Error('Package path is required unless --all is provided.');
        }

        const report = await builder.report(targets);

        outputService.logType({
            type: 'info',
            message: 'Changelog report',
            obj: report,
        });
    },
});
