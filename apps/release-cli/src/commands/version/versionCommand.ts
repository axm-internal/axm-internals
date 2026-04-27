import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { VersionService } from '../../services/VersionService';

export const versionCommand = createCommandDefinition({
    name: 'version',
    description: 'Bump a package version. Use --cascade to also bump internal dependents.',
    argsSchema: z.object({
        packagePath: PackageAppSchema.meta({
            position: 1,
            description: 'packages/<name> or apps/<name>',
        }),
        bump: z.enum(['patch', 'minor', 'major']).meta({
            position: 2,
            description: 'Version bump level.',
        }),
    }),
    optionsSchema: z.object({
        cascade: z.boolean().meta({ description: 'Also patch-bump all packages that depend on this one.' }).optional(),
    }),
    action: async ({ container, args: { packagePath, bump }, options, dryRun }) => {
        const output = container.resolve(InteractiveOutputService);
        const service = container.resolve(VersionService);

        if (options.cascade) {
            const result = service.cascadeBump(packagePath, bump, dryRun);
            output.logType({
                type: 'success',
                message: dryRun ? 'Version cascade (dry-run)' : 'Version cascade applied',
                obj: result,
            });
        } else {
            const result = service.bumpPackage(packagePath, bump, dryRun);
            output.logType({
                type: 'success',
                message: dryRun ? 'Version bump (dry-run)' : 'Version bump applied',
                obj: result,
            });
        }
    },
});
