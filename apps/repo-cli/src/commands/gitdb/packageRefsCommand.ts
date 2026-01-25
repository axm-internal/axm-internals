import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { PackageInfoService } from '../../services/PackageInfoService';
import { splitPackageApp } from '../../utils/splitPackageApp';

export const packageRefsCommand = createCommandDefinition({
    name: 'gitdb:package:refs',
    description: 'Show the first commit and release tags for a package.',
    argsSchema: z.object({
        packagePath: PackageAppSchema.meta({ description: 'apps/<name> or packages/<name>' }),
    }),
    action: async ({ container, args: { packagePath } }) => {
        const [, scope] = splitPackageApp(packagePath);
        const outputService = container.resolve(InteractiveOutputService);
        const packageInfo = container.resolve(PackageInfoService);
        const refsData = await packageInfo.refs(scope);

        outputService.logType({
            type: 'info',
            message: packagePath,
            obj: refsData,
        });
    },
});
