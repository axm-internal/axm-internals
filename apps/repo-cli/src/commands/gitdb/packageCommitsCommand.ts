import { createCommandDefinition } from '@axm-internal/cli-kit';
import type { Commit } from '@axm-internal/git-db';
import { z } from 'zod';
import { PackageAppSchema } from '../../schemas/PackageAppSchema';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { PackageInfoService } from '../../services/PackageInfoService';
import { buildCliTable } from '../../utils/buildCliTable';
import { splitPackageApp } from '../../utils/splitPackageApp';
import { truncateString } from '../../utils/truncateString';

export const packageCommitsCommand = createCommandDefinition({
    name: 'gitdb:package:commits',
    description: 'List commits for a package between two hashes (inclusive).',
    argsSchema: z.object({
        packagePath: PackageAppSchema.meta({ position: 1, description: 'apps/<name> or packages/<name>' }),
        fromHash: z.string().meta({ position: 2, description: 'Starting commit hash (inclusive).' }),
        toHash: z.string().meta({ position: 3, description: 'Ending commit hash (inclusive).' }),
    }),
    action: async ({ container, args: { packagePath, fromHash, toHash } }) => {
        const [, scope] = splitPackageApp(packagePath);
        const outputService = container.resolve(InteractiveOutputService);
        const packageInfo = container.resolve(PackageInfoService);
        const commits = await packageInfo.commits(scope, fromHash, toHash);
        const output = buildCliTable<Commit>({
            objs: commits,
            columns: {
                Hash: (row) => truncateString(row.hash, 16),
                Author: 'author_id',
                Type: (row) => row.type ?? '',
                Scope: (row) => row.scope ?? '',
                Breaking: (row) => (row.is_breaking_change === null ? '' : row.is_breaking_change ? 'yes' : 'no'),
                Message: (row) => truncateString(row.message),
                Date: (row) => row.date.toString(),
            },
        }).toString();

        outputService.log(output);
    },
});
