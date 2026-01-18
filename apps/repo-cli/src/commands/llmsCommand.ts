import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { runPackagePrompt } from '../utils/runPackagePrompt';

export const llmsCommand = createCommandDefinition({
    name: 'prompt:llms',
    description: 'Generate or refresh llms.txt for a package.',
    argsSchema: z.object({
        packagePath: z.string().describe('Package path (must start with packages/)'),
    }),
    action: async ({ args }) => {
        await runPackagePrompt('llms', args.packagePath);
    },
});
