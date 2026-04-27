import path from 'node:path';
import { findRepoRoot } from './utils/findRepoRoot';

const packageRoot = findRepoRoot('.');
const gitDbPath = path.join(packageRoot, '.git-db', 'database.sqlite');

export default {
    packageRoot,
    gitDbPath,
};
