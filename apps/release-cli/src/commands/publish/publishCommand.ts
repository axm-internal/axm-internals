import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { PublishService } from '../../services/PublishService';

export const publishCommand = createCommandDefinition({
    name: 'publish',
    description: 'Publish a package to the npm registry.',
    argsSchema: z.object({
        packagePath: PackageAppSchema.optional().meta({
            position: 1,
            description: 'packages/<name> (required unless --all).',
        }),
    }),
    optionsSchema: z.object({
        all: z.boolean().meta({ description: 'Publish all publishable packages.' }).optional(),
        tag: z
            .string()
            .meta({ description: 'npm dist-tag (e.g., "next", "beta").', aliases: ['dist-tag'] })
            .optional(),
    }),
    action: async ({ container, args: { packagePath }, options, dryRun }) => {
        const output = container.resolve(InteractiveOutputService);
        const service = container.resolve(PublishService);

        if (!packagePath && !options.all) {
            throw new Error('Package path is required unless --all is provided.');
        }

        if (options.all) {
            const results = await service.publishAll({ distTag: options.tag, dryRun });
            output.logType({
                type: 'success',
                message: dryRun ? 'Publish all (dry-run)' : 'Published all packages',
                obj: results,
            });
        } else if (packagePath) {
            const result = await service.publishPackage(packagePath, { distTag: options.tag, dryRun });
            output.logType({
                type: 'success',
                message: dryRun ? `Publish (dry-run): ${packagePath}` : `Published: ${packagePath}`,
                obj: result,
            });
        }
    },
});
