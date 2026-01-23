import { describe, expect, it } from 'bun:test';
import { openBunDb } from '../../../src';
import { getIndexState, setIndexState } from '../../../src/db/client';

describe('db client', () => {
    it('opens a db and ensures schema', async () => {
        const db = await openBunDb(':memory:');
        try {
            const tables = await db.introspection.getTables();
            const tableNames = tables.map((table) => table.name);
            expect(tableNames).toContain('authors');
            expect(tableNames).toContain('commits');
            expect(tableNames).toContain('commit_files');
            expect(tableNames).toContain('meta');
        } finally {
            await db.destroy();
        }
    });

    it('round-trips null index state values', async () => {
        const db = await openBunDb(':memory:');
        try {
            await setIndexState(db, {
                lastIndexedHash: null,
                lastIndexedDate: null,
                schemaVersion: 1,
            });

            const state = await getIndexState(db);
            expect(state.lastIndexedHash).toBeNull();
            expect(state.lastIndexedDate).toBeNull();
            expect(state.schemaVersion).toBe(1);
        } finally {
            await db.destroy();
        }
    });
});
