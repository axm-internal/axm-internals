import { InMemoryContainer } from '@axm-internal/cli-kit';
import { appConfig } from './appConfig';
import { ChangelogBuilder } from './services/ChangelogBuilder';
import { ChangelogStore } from './services/ChangelogStore';
import { GitQuery } from './services/GitQuery';
import { InteractiveOutputService } from './services/InteractiveOutputService';
import { PackageInfoService } from './services/PackageInfoService';

const container = new InMemoryContainer();

const interactiveOutputService = new InteractiveOutputService();
container.registerInstance(InteractiveOutputService, interactiveOutputService);

const gitQuery = new GitQuery({ dbPath: appConfig.gitDb.dbPath });
container.registerInstance(GitQuery, gitQuery);

const packageInfoService = new PackageInfoService(gitQuery);
container.registerInstance(PackageInfoService, packageInfoService);

const changelogStore = new ChangelogStore();
container.registerInstance(ChangelogStore, changelogStore);

const changelogBuilder = new ChangelogBuilder(packageInfoService, changelogStore);
container.registerInstance(ChangelogBuilder, changelogBuilder);

export { container as appContainer, interactiveOutputService };
