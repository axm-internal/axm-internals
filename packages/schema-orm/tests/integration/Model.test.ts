import { afterEach, beforeAll, describe, expect, it } from 'bun:test';
import { getTableColumns } from 'drizzle-orm/utils';
import { z } from 'zod';
import { getAdapterInstance } from '../../src/db/adapters/getAdapterInstance';
import { defineDatabase } from '../../src/db/defineDatabase';
import { Model } from '../../src/db/Model';
import { makeAutoIncrement, makeJson, makePrimaryKey } from '../../src/schema/meta';
import { modelFixtures } from '../fixtures';
import { createTestTables, resetTables, seedTestTables } from '../helpers/DbHelper';

// Adapter-specific integration runs require the adapter's native runtime.
// For now, we only run bun-sqlite under Bun. Others run in dedicated envs later.
const adapters = [{ name: 'bun-sqlite', adapter: 'bun-sqlite' as const }];

describe('Model (integration)', () => {
    type Schema = typeof modelFixtures.users.modelConfig.schema;
    const modelConfig = modelFixtures.users.modelConfig;

    for (const { name, adapter } of adapters) {
        describe(name, () => {
            let model: Model<Schema>;
            let runner: ReturnType<ReturnType<typeof getAdapterInstance>['getSqlRunner']>;

            beforeAll(() => {
                const modelDefinitions = { users: modelConfig };
                const adapterInstance = getAdapterInstance({
                    adapter,
                    databasePath: ':memory:',
                    modelDefinitions,
                    usePragmaPreset: false,
                });
                runner = adapterInstance.getSqlRunner();
                createTestTables(runner);
                seedTestTables(runner);
                model = new Model<Schema>({ db: adapterInstance.getDrizzleDatabase(), modelConfig });
            });

            afterEach(() => {
                resetTables(runner);
            });

            describe('findById', () => {
                it('returns the row by primary key', () => {
                    const row = model.findById({ id: 1 });
                    expect(row).toEqual({ id: 1, name: 'Ada' });
                });
            });

            describe('findOne', () => {
                it('returns the first matching row', () => {
                    const row = model.findOne({ where: { name: 'Bob' } });
                    expect(row).toEqual({ id: 2, name: 'Bob' });
                });
            });

            describe('no-arg calls', () => {
                it('findMany returns all rows', () => {
                    const rows = model.findMany();
                    expect(rows).toEqual([
                        { id: 1, name: 'Ada' },
                        { id: 2, name: 'Bob' },
                        { id: 3, name: 'Cleo' },
                    ]);
                });

                it('findPaginated uses defaults', () => {
                    const result = model.findPaginated();
                    expect(result.pagination).toEqual({ page: 1, pages: 1, limit: 50 });
                    expect(result.items).toEqual([
                        { id: 1, name: 'Ada' },
                        { id: 2, name: 'Bob' },
                        { id: 3, name: 'Cleo' },
                    ]);
                });

                it('count returns all rows', () => {
                    expect(model.count()).toBe(3);
                });
            });

            describe('findMany', () => {
                it('returns matching rows with order and limit', () => {
                    const rows = model.findMany({
                        where: { name: 'Ada' },
                        orderBy: [{ field: 'id', direction: 'asc' }],
                        limit: 2,
                    });
                    expect(rows).toEqual([{ id: 1, name: 'Ada' }]);
                });
            });

            describe('findPaginated', () => {
                it('returns items with pagination metadata', () => {
                    const result = model.findPaginated({
                        orderBy: [{ field: 'id', direction: 'asc' }],
                        pagination: { page: 1, limit: 2 },
                    });
                    expect(result.pagination).toEqual({ page: 1, pages: 2, limit: 2 });
                    expect(result.items).toEqual([
                        { id: 1, name: 'Ada' },
                        { id: 2, name: 'Bob' },
                    ]);
                });

                it('returns empty items when page exceeds total pages', () => {
                    const result = model.findPaginated({
                        orderBy: [{ field: 'id', direction: 'asc' }],
                        pagination: { page: 3, limit: 2 },
                    });
                    expect(result.pagination).toEqual({ page: 3, pages: 2, limit: 2 });
                    expect(result.items).toEqual([]);
                });
            });

            describe('exists', () => {
                it('returns true when a row exists', () => {
                    expect(model.exists({ where: { id: 1 } })).toBe(true);
                });

                it('returns false when no rows match', () => {
                    expect(model.exists({ where: { id: 999 } })).toBe(false);
                });
            });

            describe('count', () => {
                it('counts all rows', () => {
                    expect(model.count({})).toBe(3);
                });

                it('counts rows with a where clause', () => {
                    expect(model.count({ where: { name: 'Cleo' } })).toBe(1);
                });
            });

            describe('save', () => {
                it('inserts a new row and returns it', () => {
                    const inserted = model.save({ data: { id: 4, name: 'Dana' } });
                    expect(inserted).toEqual({ id: 4, name: 'Dana' });
                    expect(model.findById({ id: 4 })).toEqual({ id: 4, name: 'Dana' });
                });

                it('throws when validation fails by default', () => {
                    expect(() => model.save({ data: { id: 99, name: 123 as unknown as string } })).toThrow();
                });

                it('skips validation when validate is false', () => {
                    const inserted = model.save({ data: { id: 100, name: 123 as unknown as string }, validate: false });
                    expect(inserted).toEqual({ id: 100, name: '123' });
                });

                it('allows inserts without autoincrement ids', () => {
                    const inserted = model.save({ data: { name: 'Erin' } });
                    expect(inserted?.name).toBe('Erin');
                    expect(typeof inserted?.id).toBe('number');
                });
            });

            describe('saveMany', () => {
                it('inserts multiple rows', () => {
                    const rows = model.saveMany({
                        data: [
                            { id: 4, name: 'Dana' },
                            { id: 5, name: 'Eve' },
                        ],
                    });
                    expect(rows).toEqual([
                        { id: 4, name: 'Dana' },
                        { id: 5, name: 'Eve' },
                    ]);
                    expect(model.count({})).toBe(5);
                });
            });

            describe('update', () => {
                it('updates matching rows', () => {
                    const updated = model.update({
                        where: { id: 2 },
                        data: { name: 'Bobby' },
                        validate: false,
                    });
                    expect(updated).toBe(1);
                    expect(model.findById({ id: 2 })).toEqual({ id: 2, name: 'Bobby' });
                });

                it('requires a where clause', () => {
                    expect(() => model.update({ where: {}, data: { name: 'Nope' }, validate: false })).toThrow(
                        'update requires a where clause'
                    );
                });
            });

            describe('upsert', () => {
                it('updates when the row exists', () => {
                    const row = model.upsert({
                        where: { id: 3 },
                        data: { id: 3, name: 'Cleo2' },
                    });
                    expect(row).toEqual({ id: 3, name: 'Cleo2' });
                });

                it('inserts when the row does not exist', () => {
                    const row = model.upsert({
                        where: { id: 10 },
                        data: { id: 10, name: 'Zed' },
                    });
                    expect(row).toEqual({ id: 10, name: 'Zed' });
                });
            });

            describe('remove', () => {
                it('deletes matching rows', () => {
                    const removed = model.remove({ where: { id: 1 } });
                    expect(removed).toBe(1);
                    expect(model.findById({ id: 1 })).toBeNull();
                });

                it('requires a where clause', () => {
                    expect(() => model.remove({ where: {} })).toThrow('remove requires a where clause');
                });
            });

            describe('removeMany', () => {
                it('deletes matching rows', () => {
                    const removed = model.removeMany({ where: { name: 'Bob' } });
                    expect(removed).toBe(1);
                    expect(model.findById({ id: 2 })).toBeNull();
                });
            });

            describe('advanced WHERE operators', () => {
                it('filters with { gt } operator', () => {
                    const rows = model.findMany({ where: { id: { gt: 1 } } });
                    expect(rows.map((r) => r.name)).toEqual(['Bob', 'Cleo']);
                });

                it('filters with { lt } operator', () => {
                    const rows = model.findMany({ where: { id: { lt: 3 } } });
                    expect(rows.map((r) => r.name)).toEqual(['Ada', 'Bob']);
                });

                it('filters with { gte } operator', () => {
                    const rows = model.findMany({ where: { id: { gte: 2 } } });
                    expect(rows.map((r) => r.name)).toEqual(['Bob', 'Cleo']);
                });

                it('filters with { lte } operator', () => {
                    const rows = model.findMany({ where: { id: { lte: 2 } } });
                    expect(rows.map((r) => r.name)).toEqual(['Ada', 'Bob']);
                });

                it('filters with { ne } operator', () => {
                    const rows = model.findMany({ where: { id: { ne: 2 } } });
                    expect(rows.map((r) => r.name)).toEqual(['Ada', 'Cleo']);
                });

                it('filters with { like } operator', () => {
                    const rows = model.findMany({ where: { name: { like: 'A%' } } });
                    expect(rows.map((r) => r.name)).toEqual(['Ada']);
                });

                it('filters with { in } operator', () => {
                    const rows = model.findMany({ where: { id: { in: [1, 3] } } });
                    expect(rows.map((r) => r.name)).toEqual(['Ada', 'Cleo']);
                });

                it('filters with { between } operator', () => {
                    const rows = model.findMany({ where: { id: { between: [1, 2] } } });
                    expect(rows.map((r) => r.name)).toEqual(['Ada', 'Bob']);
                });

                it('combines plain values and operators', () => {
                    const rows = model.findMany({
                        where: { id: { gt: 1 }, name: { like: '%o%' } },
                    });
                    expect(rows.map((r) => r.name)).toEqual(['Bob', 'Cleo']);
                });

                it('plain values still work as equality (backward compat)', () => {
                    const rows = model.findMany({ where: { name: 'Ada' } });
                    expect(rows).toEqual([{ id: 1, name: 'Ada' }]);
                });
            });

            describe('composite primary keys', () => {
                type UserRoleSchema = typeof modelFixtures.userRoles.modelConfig.schema;
                let userRolesModel: Model<UserRoleSchema>;

                beforeAll(() => {
                    const fixture = modelFixtures.userRoles;
                    const adapterInstance = getAdapterInstance({
                        adapter: 'bun-sqlite',
                        databasePath: ':memory:',
                        modelDefinitions: { userRoles: fixture.modelConfig },
                        usePragmaPreset: false,
                    });
                    runner = adapterInstance.getSqlRunner();
                    createTestTables(runner);
                    seedTestTables(runner);
                    userRolesModel = new Model<UserRoleSchema>({
                        db: adapterInstance.getDrizzleDatabase(),
                        modelConfig: fixture.modelConfig,
                    });
                });

                it('findById with object id for composite PK', () => {
                    const row = userRolesModel.findById({ id: { userId: 1, roleId: 10 } });
                    expect(row).toEqual({ userId: 1, roleId: 10, grantedAt: '2024-01-01' });
                });

                it('findById throws for scalar id with composite PK', () => {
                    expect(() => userRolesModel.findById({ id: 1 })).toThrow(
                        'findById with a scalar id requires a single primary key column'
                    );
                });

                it('findOne with composite PK where', () => {
                    const row = userRolesModel.findOne({ where: { userId: 2, roleId: 10 } });
                    expect(row).toEqual({ userId: 2, roleId: 10, grantedAt: '2024-01-03' });
                });

                it('remove with composite PK where', () => {
                    const removed = userRolesModel.remove({ where: { userId: 1, roleId: 20 } });
                    expect(removed).toBe(1);
                    expect(userRolesModel.findById({ id: { userId: 1, roleId: 20 } })).toBeNull();
                });

                it('save inserts row with composite PK', () => {
                    const row = userRolesModel.save({ data: { userId: 3, roleId: 30, grantedAt: '2024-02-01' } });
                    expect(row).toEqual({ userId: 3, roleId: 30, grantedAt: '2024-02-01' });
                });
            });

            describe('drizzle escape hatch', () => {
                it('getDrizzleDb returns the underlying drizzle database', () => {
                    const drizzleDb = model.getDrizzleDb();
                    expect(drizzleDb).toBeDefined();
                    expect(typeof drizzleDb.select).toBe('function');
                    expect(typeof drizzleDb.insert).toBe('function');
                    expect(typeof drizzleDb.update).toBe('function');
                    expect(typeof drizzleDb.delete).toBe('function');
                });

                it('getTable returns the drizzle table object with column keys', () => {
                    const table = model.getTable();
                    expect(table).toBeDefined();
                    const columns = getTableColumns(table);
                    expect(Object.keys(columns)).toContain('id');
                    expect(Object.keys(columns)).toContain('name');
                });

                it('can perform a raw drizzle query using escape hatch', () => {
                    const drizzleDb = model.getDrizzleDb();
                    const table = model.getTable();
                    const rows = drizzleDb.select().from(table).all() as Array<{
                        id: number;
                        name: string;
                    }>;
                    const names = rows.map((r) => r.name).sort();
                    expect(names).toEqual(['Ada', 'Bob', 'Cleo']);
                });
            });

            describe('json columns', () => {
                it('round-trips objects and arrays', () => {
                    const db = defineDatabase({
                        adapter,
                        databasePath: ':memory:',
                        usePragmaPreset: false,
                        modelDefinitions: {
                            JsonItems: {
                                table: 'json_items',
                                schema: z.object({
                                    id: makeAutoIncrement(makePrimaryKey(z.number().int())),
                                    payload: makeJson(
                                        z.object({
                                            tags: z.array(z.string()).optional(),
                                            prefs: z.object({ theme: z.string() }).optional(),
                                        })
                                    ),
                                    labels: makeJson(z.array(z.string())),
                                }),
                            },
                        },
                    });

                    const inserted = db.JsonItems.save({
                        data: {
                            payload: { tags: ['a', 'b'], prefs: { theme: 'dark' } },
                            labels: ['x', 'y'],
                        },
                    });

                    expect(inserted.payload).toEqual({ tags: ['a', 'b'], prefs: { theme: 'dark' } });
                    expect(inserted.labels).toEqual(['x', 'y']);

                    const fetched = db.JsonItems.findById({ id: inserted.id });
                    expect(fetched?.payload).toEqual({ tags: ['a', 'b'], prefs: { theme: 'dark' } });
                    expect(fetched?.labels).toEqual(['x', 'y']);

                    const updated = db.JsonItems.update({
                        where: { id: inserted.id },
                        data: { payload: { tags: ['c'], prefs: { theme: 'light' } }, labels: ['z'] },
                    });
                    expect(updated).toBe(1);

                    const afterUpdate = db.JsonItems.findById({ id: inserted.id });
                    expect(afterUpdate?.payload).toEqual({ tags: ['c'], prefs: { theme: 'light' } });
                    expect(afterUpdate?.labels).toEqual(['z']);
                });
            });
        });
    }
});
