import { gitDbIndexCommand } from './indexCommand';
import { packageCommitsCommand } from './packageCommitsCommand';
import { packageRefsCommand } from './packageRefsCommand';
import { packageReleasesCommand } from './packageReleasesCommand';

export const gitDbCommands = [gitDbIndexCommand, packageRefsCommand, packageCommitsCommand, packageReleasesCommand];
