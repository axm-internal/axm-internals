import { describe, expect, it } from 'bun:test';
import { createBunDb } from '../../../src/db/database-bun';
import { migrate } from '../../../src/db/migrations';

describe('db migrations', () => {
    it('sets schema version on initial migrate', async () => {
        const db = createBunDb(':memory:');
        try {
            await migrate(db);
            const row = await db
                .selectFrom('meta')
                .select('value')
                .where('key', '=', 'schema_version')
                .executeTakeFirst();
            expect(row?.value).toBe('1');
        } finally {
            await db.destroy();
        }
    });
});
