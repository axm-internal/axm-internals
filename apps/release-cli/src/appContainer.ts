import { InMemoryContainer } from '@axm-internal/cli-kit';
import constants from './constants';
import { InteractiveOutputService } from './services/InteractiveOutputService';
import { PublishService } from './services/PublishService';
import { ReleaseService } from './services/ReleaseService';
import { TagService } from './services/TagService';
import { VersionService } from './services/VersionService';

const container = new InMemoryContainer();

const interactiveOutputService = new InteractiveOutputService();
container.registerInstance(InteractiveOutputService, interactiveOutputService);

const versionService = new VersionService({ repoRoot: constants.packageRoot });
container.registerInstance(VersionService, versionService);

const tagService = new TagService();
container.registerInstance(TagService, tagService);

const publishService = new PublishService({ repoRoot: constants.packageRoot });
container.registerInstance(PublishService, publishService);

const releaseService = new ReleaseService({
    versionService,
    tagService,
    publishService,
    outputService: interactiveOutputService,
});
container.registerInstance(ReleaseService, releaseService);

export { container as appContainer, interactiveOutputService };
