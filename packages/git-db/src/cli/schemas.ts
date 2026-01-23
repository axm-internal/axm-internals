import { z } from 'zod';

export const DBPathSchema = z
    .string()
    .meta({ description: 'Path to the SQLite db file.' })
    .default('.git-db/database.sqlite');
