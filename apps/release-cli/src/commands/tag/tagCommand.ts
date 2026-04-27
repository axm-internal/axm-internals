import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { TagService } from '../../services/TagService';
import { VersionService } from '../../services/VersionService';

export const tagCommand = createCommandDefinition({
    name: 'tag',
    description: 'Create a git tag for a package at its current version.',
    argsSchema: z.object({
        packagePath: PackageAppSchema.meta({
            position: 1,
            description: 'packages/<name> or apps/<name>',
        }),
    }),
    optionsSchema: z.object({
        push: z.boolean().meta({ description: 'Push the tag to origin after creation.' }).optional(),
    }),
    action: async ({ container, args: { packagePath }, options, dryRun }) => {
        const output = container.resolve(InteractiveOutputService);
        const versionService = container.resolve(VersionService);
        const tagService = container.resolve(TagService);

        const version = versionService.readCurrentVersion(packagePath);
        const result = await tagService.createTag(packagePath, version, {
            push: options.push,
            dryRun,
        });

        output.logType({
            type: 'success',
            message: dryRun ? 'Tag (dry-run)' : 'Tag created',
            obj: result,
        });
    },
});
