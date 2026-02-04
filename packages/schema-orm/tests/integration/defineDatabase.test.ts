import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { getAdapterInstance } from '../../src/db/adapters/getAdapterInstance';
import { defineDatabase } from '../../src/db/defineDatabase';
import { makeAutoIncrement, makePrimaryKey } from '../../src/schema/meta';

const createModelDefinitions = () => ({
    users: {
        table: 'users',
        schema: z.object({
            id: makeAutoIncrement(makePrimaryKey(z.number().int())),
            name: z.string(),
        }),
    },
});

const createTempDbPath = (adapter: string) =>
    `/tmp/schema-orm-${adapter}-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`;

// Adapter-specific integration runs require the adapter's native runtime.
// For now, we only run bun-sqlite under Bun. Others run in dedicated envs later.
const adapters = [{ name: 'bun-sqlite', adapter: 'bun-sqlite' as const }];

describe('defineDatabase (integration)', () => {
    for (const { name, adapter } of adapters) {
        describe(name, () => {
            it('creates tables and stores schema hash', () => {
                const dbPath = createTempDbPath(adapter);
                const modelDefinitions = createModelDefinitions();

                const models = defineDatabase({ adapter, databasePath: dbPath, modelDefinitions });
                expect(models.users).toBeDefined();

                const adapterInstance = getAdapterInstance({
                    adapter,
                    databasePath: dbPath,
                    modelDefinitions,
                    usePragmaPreset: false,
                });
                const meta = adapterInstance
                    .getSqlRunner()
                    .query('SELECT schema_hash FROM "__bun_record_db_meta" WHERE table_name = ?')
                    .get(['users']) as { schema_hash: string } | undefined;

                expect(meta?.schema_hash).toBeDefined();
            });

            it('warns when schema hash changes', () => {
                const dbPath = createTempDbPath(adapter);
                const modelDefinitions = createModelDefinitions();
                defineDatabase({ adapter, databasePath: dbPath, modelDefinitions });

                const schemaChanges: Array<{ table: string; storedHash: string; currentHash: string }> = [];

                const updatedDefinitions = {
                    users: {
                        table: 'users',
                        schema: z.object({
                            id: makeAutoIncrement(makePrimaryKey(z.number().int())),
                            name: z.string(),
                            email: z.email(),
                        }),
                    },
                };

                defineDatabase({
                    adapter,
                    databasePath: dbPath,
                    modelDefinitions: updatedDefinitions,
                    hooks: {
                        onSchemaChange: (payload) => schemaChanges.push(payload),
                    },
                });

                expect(schemaChanges.length).toBeGreaterThan(0);
                expect(schemaChanges[0]?.table).toBe('users');
            });

            it('calls onConnect, onFirstCreate, onSchemaChange, and onModelsReady', () => {
                const dbPath = createTempDbPath(adapter);
                const modelDefinitions = createModelDefinitions();

                const onConnectCalls: number[] = [];
                const onFirstCreateCalls: number[] = [];
                const onSchemaChangeCalls: Array<{ table: string; storedHash: string; currentHash: string }> = [];
                const onModelsReadyCalls: Array<{ models: Record<string, unknown> }> = [];

                defineDatabase({
                    adapter,
                    databasePath: dbPath,
                    modelDefinitions,
                    hooks: {
                        onConnect: ({ adapter: hookAdapter, runner }) => {
                            expect(hookAdapter).toBeDefined();
                            expect(runner).toBeDefined();
                            onConnectCalls.push(1);
                        },
                        onFirstCreate: ({ adapter: hookAdapter, runner }) => {
                            expect(hookAdapter).toBeDefined();
                            expect(runner).toBeDefined();
                            onFirstCreateCalls.push(1);
                        },
                        onSchemaChange: (payload) => {
                            onSchemaChangeCalls.push(payload);
                        },
                        onModelsReady: ({ models }) => {
                            onModelsReadyCalls.push({ models });
                        },
                    },
                });

                expect(onConnectCalls.length).toBe(1);
                expect(onFirstCreateCalls.length).toBe(1);
                expect(onSchemaChangeCalls.length).toBe(0);
                expect(onModelsReadyCalls.length).toBe(1);

                defineDatabase({
                    adapter,
                    databasePath: dbPath,
                    modelDefinitions,
                    hooks: {
                        onFirstCreate: () => onFirstCreateCalls.push(1),
                    },
                });

                expect(onFirstCreateCalls.length).toBe(1);

                const updatedDefinitions = {
                    users: {
                        table: 'users',
                        schema: z.object({
                            id: makeAutoIncrement(makePrimaryKey(z.number().int())),
                            name: z.string(),
                            email: z.email(),
                        }),
                    },
                };

                defineDatabase({
                    adapter,
                    databasePath: dbPath,
                    modelDefinitions: updatedDefinitions,
                    hooks: {
                        onSchemaChange: (payload) => onSchemaChangeCalls.push(payload),
                    },
                });

                expect(onSchemaChangeCalls.length).toBe(1);
                expect(onSchemaChangeCalls[0]?.table).toBe('users');
            });
        });
    }
});
