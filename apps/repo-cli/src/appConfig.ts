import { autoEnv, defineConfig } from '@axm-internal/config-schema';
import { z } from 'zod';
import constants from './constants';

export const ConfigSchema = z.object({
    gitDb: z.object({
        dbPath: autoEnv(z.string()).default(constants.gitDbPath),
    }),
});

export type Config = z.infer<typeof ConfigSchema>;

export const appConfig: Config = defineConfig(ConfigSchema);
