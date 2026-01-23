import { describe, expect, it } from 'bun:test';
import { createBunDb } from '../../../src/db/database-bun';
import { migrate } from '../../../src/db/migrations';
import { readCommits } from '../../../src/git/log';
import { scanCommits } from '../../../src/indexer/commitScanner';

describe('scanCommits', () => {
    it('indexes commits and updates state', async () => {
        const db = createBunDb(':memory:');
        try {
            await migrate(db);

            const commits = await readCommits({ limit: 1 });
            expect(commits.length).toBeGreaterThan(0);

            const result = await scanCommits(db, { limit: 1 });
            expect(result.indexedCount).toBe(1);
            expect(result.lastIndexedHash).toBe(commits[0]?.hash ?? null);

            const meta = await db
                .selectFrom('meta')
                .select('value')
                .where('key', '=', 'last_indexed_hash')
                .executeTakeFirst();
            expect(meta?.value).toBe(commits[0]?.hash);
        } finally {
            await db.destroy();
        }
    });
});
