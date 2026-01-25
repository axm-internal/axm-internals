import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { PackageInfoService } from '../../services/PackageInfoService';
import { splitPackageApp } from '../../utils/splitPackageApp';

export const packageReleasesCommand = createCommandDefinition({
    name: 'gitdb:package:releases',
    description: 'List release tags for all packages or a single package.',
    argsSchema: z.object({
        packagePath: PackageAppSchema.optional().meta({ description: 'Optional apps/<name> or packages/<name>' }),
    }),
    action: async ({ container, args: { packagePath } }) => {
        const packageInfo = container.resolve(PackageInfoService);
        const outputService = container.resolve(InteractiveOutputService);
        let targetScope: string | undefined;

        if (packagePath) {
            const [, scope] = splitPackageApp(packagePath);
            targetScope = scope;
        }

        const releases = await packageInfo.releases(targetScope);

        outputService.logType({
            type: 'info',
            message: `${targetScope ?? 'All'} releases`,
            obj: releases,
        });
    },
});
