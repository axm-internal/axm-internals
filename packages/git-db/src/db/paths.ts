import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export const ensureDbPath = (dbPath: string): string => {
    const dir = dirname(dbPath);
    if (dir && dir !== '.') {
        mkdirSync(dir, { recursive: true });
    }
    return dbPath;
};
