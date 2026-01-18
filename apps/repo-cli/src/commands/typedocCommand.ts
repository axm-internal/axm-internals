import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { runPackagePrompt } from '../utils/runPackagePrompt';

export const typedocCommand = createCommandDefinition({
    name: 'prompt:typedoc',
    description: 'Add or improve Typedoc/TSDoc docblocks for a package.',
    argsSchema: z.object({
        packagePath: z.string().describe('Package path (must start with packages/ or apps/)'),
    }),
    action: async ({ args }) => {
        await runPackagePrompt('typedoc', args.packagePath);
    },
});
