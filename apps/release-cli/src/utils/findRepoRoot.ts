import fs from 'node:fs';
import path from 'node:path';

export const findRepoRoot = (startDir: string): string => {
    let current = path.resolve(startDir);
    while (true) {
        const gitDir = path.join(current, '.git');
        if (fs.existsSync(gitDir)) {
            return current;
        }
        const parent = path.dirname(current);
        if (parent === current) {
            return startDir;
        }
        current = parent;
    }
};
