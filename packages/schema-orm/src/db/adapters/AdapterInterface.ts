import type { AnySQLiteDb, Pragmas } from '../../types';
import type { SqlRunner } from '../schema-metadata';

export const AdapterTypes = ['bun-sqlite', 'better-sqlite3', 'expo-sqlite'] as const;
export type AdapterType = (typeof AdapterTypes)[number];

export type AdapterInterface<TDrizzle extends AnySQLiteDb = AnySQLiteDb> = {
    readonly id: AdapterType;

    getDrizzleDatabase: () => TDrizzle;
    getSqlRunner: () => SqlRunner;
    applyPragmas: (pragmas: Pragmas) => void;
    presetPragmas: () => Pragmas;
};
