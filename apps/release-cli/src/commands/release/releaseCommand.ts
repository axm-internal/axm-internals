import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { ReleaseService } from '../../services/ReleaseService';

export const releaseCommand = createCommandDefinition({
    name: 'release',
    description: 'Full release orchestration: index, changelog, version, tag, commit, publish.',
    argsSchema: z.object({
        packagePath: PackageAppSchema.meta({
            position: 1,
            description: 'packages/<name>',
        }),
        bump: z.enum(['patch', 'minor', 'major']).meta({
            position: 2,
            description: 'Version bump level.',
        }),
    }),
    optionsSchema: z.object({
        cascade: z.boolean().meta({ description: 'Cascade version bumps to internal dependents.' }).optional(),
        push: z.boolean().meta({ description: 'Push the git tag to origin.' }).optional(),
        'skip-publish': z.boolean().meta({ description: 'Run everything except the publish step.' }).optional(),
        'dist-tag': z.string().meta({ description: 'npm dist-tag for the publish step.' }).optional(),
    }),
    action: async ({ container, args: { packagePath, bump }, options, dryRun }) => {
        const output = container.resolve(InteractiveOutputService);
        const service = container.resolve(ReleaseService);

        const spinner = output.startSpinner('Running release...');

        const result = await service.release({
            packagePath,
            bump,
            cascade: options.cascade,
            pushTag: options.push,
            skipPublish: options['skip-publish'],
            distTag: options['dist-tag'],
            dryRun,
        });

        spinner.stop();

        output.logType({
            type: 'success',
            message: dryRun ? 'Release (dry-run)' : 'Release complete',
            obj: result,
        });
    },
});
