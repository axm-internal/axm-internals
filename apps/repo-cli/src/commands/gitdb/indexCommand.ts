import { createCommandDefinition } from '@axm-internal/cli-kit';
import { InteractiveOutputService } from '../../services/InteractiveOutputService';
import { PackageInfoService } from '../../services/PackageInfoService';

export const gitDbIndexCommand = createCommandDefinition({
    name: 'gitdb:index',
    description: 'Initialize or update the git-db SQLite index for the repo.',
    action: async ({ container }) => {
        const outputService = container.resolve(InteractiveOutputService);
        const packageInfo = container.resolve(PackageInfoService);
        const spinner = outputService.startSpinner('Indexing GitDb');
        await packageInfo.indexDb();
        spinner.start('database updated');
        spinner.start('closing database connection');
        await packageInfo.closeDb();
        spinner.stop();
        outputService.logSuccess('Indexing Completed');
    },
});
