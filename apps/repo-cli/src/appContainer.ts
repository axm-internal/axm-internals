import { appConfig } from './appConfig';
import { ChangelogBuilder } from './services/ChangelogBuilder';
import { ChangelogStore } from './services/ChangelogStore';
import { ChangeSetBuilder } from './services/ChangeSetBuilder';
import { ChangeSetWriter } from './services/ChangeSetWriter';
import { GitQuery } from './services/GitQuery';
import { InteractiveOutputService } from './services/InteractiveOutputService';
import { PackageInfoService } from './services/PackageInfoService';
import { createContainer } from './utils/createContainer';

const { container: appContainer, registerFactory } = createContainer();

registerFactory(InteractiveOutputService, () => new InteractiveOutputService());
registerFactory(
    GitQuery,
    () =>
        new GitQuery({
            dbPath: appConfig.gitDb.dbPath,
        })
);
registerFactory(PackageInfoService, (c) => new PackageInfoService(c.resolve(GitQuery)));
registerFactory(ChangelogStore, () => new ChangelogStore());
registerFactory(
    ChangelogBuilder,
    (c) => new ChangelogBuilder(c.resolve(PackageInfoService), c.resolve(ChangelogStore))
);
registerFactory(ChangeSetBuilder, (c) => new ChangeSetBuilder(c.resolve(PackageInfoService)));
registerFactory(ChangeSetWriter, () => new ChangeSetWriter());

export { appContainer };
