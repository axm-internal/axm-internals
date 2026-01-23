import { describe, expect, it } from 'bun:test';
import { openBunDb } from '../../../src';

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
});
