import type { DatabaseConfigInput } from '../../types';
import { BetterSqlite3Adapter } from './BetterSqlite3Adapter';
import { BunSqliteAdapter } from './BunSqliteAdapter';
import { ExpoSqliteAdapter } from './ExpoSqliteAdapter';

export const getAdapterInstance = (config: DatabaseConfigInput) => {
    switch (config.adapter) {
        case 'bun-sqlite':
            return new BunSqliteAdapter(config);
        case 'better-sqlite3':
            return new BetterSqlite3Adapter(config);
        case 'expo-sqlite':
            return new ExpoSqliteAdapter(config);
        default:
            throw new Error(`Adapter ${config.adapter} not implemented`);
    }
};
