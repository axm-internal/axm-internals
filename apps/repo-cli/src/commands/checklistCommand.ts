import { createCommandDefinition } from '@axm-internal/cli-kit';
import { z } from 'zod';
import { runPackagePrompt } from '../utils/runPackagePrompt';

export const checklistCommand = createCommandDefinition({
    name: 'prompt:checklist',
    description: 'Run the dev-complete checklist for a package and write checklist.md.',
    argsSchema: z.object({
        packagePath: z.string().describe('Package path (must start with packages/)'),
    }),
    action: async ({ args }) => {
        await runPackagePrompt('checklist', args.packagePath);
    },
});
