import type { z } from 'zod';
import { DatabaseConfigSchema } from '../schema/schemas';
import { generateCreateTable } from '../sql/ddl/TableSqlGenerator';
import type { DatabaseConfigInput, DefineDatabaseHookContext, DefineDatabaseHooks } from '../types';
import { getAdapterInstance } from './adapters/getAdapterInstance';
import { resolvePragmas } from './adapters/resolvePragmas';
import { Model } from './Model';
import { checkSchemaHash, ensureMetaTable, isFirstCreate } from './schema-metadata';

type ModelDefinitions = Record<string, { table: string; schema: z.ZodObject<z.ZodRawShape> }>;
type ModelsFor<T extends ModelDefinitions> = {
    [K in keyof T]: Model<T[K]['schema']>;
};
type DefineDatabaseOptions<T extends ModelDefinitions> = Omit<DatabaseConfigInput, 'hooks' | 'modelDefinitions'> & {
    modelDefinitions: T;
    hooks?: DefineDatabaseHooks<ModelsFor<T>>;
};

export const defineDatabase = <T extends ModelDefinitions>(options: DefineDatabaseOptions<T>) => {
    const config = DatabaseConfigSchema.parse(options);
    const hooks: Required<DefineDatabaseHooks<ModelsFor<T>>> = {
        onConnect: (_args: DefineDatabaseHookContext<ModelsFor<T>>) => {},
        onFirstCreate: (_args: DefineDatabaseHookContext<ModelsFor<T>> & { models: ModelsFor<T> }) => {},
        onSchemaChange: (_args: { table: string; storedHash: string; currentHash: string }) => {},
        onModelsReady: (_args: { models: ModelsFor<T> }) => {},
        ...(config.hooks as DefineDatabaseHooks<ModelsFor<T>>),
    };
    const adapter = getAdapterInstance(config);
    adapter.applyPragmas(
        resolvePragmas({
            userDefined: config.pragma,
            preset: adapter.presetPragmas(),
            usePragmaPreset: config.usePragmaPreset,
        })
    );

    const runner = adapter.getSqlRunner();
    const db = adapter.getDrizzleDatabase();
    hooks.onConnect({ adapter, runner });
    ensureMetaTable(runner);
    const firstCreate = isFirstCreate(runner);
    const models = {} as ModelsFor<T>;
    (Object.entries(config.modelDefinitions) as Array<[keyof T, T[keyof T]]>).forEach(([modelName, modelConfig]) => {
        const createSql = generateCreateTable(modelConfig);
        runner.run(createSql);
        const checkResult = checkSchemaHash(runner, modelConfig);
        if (checkResult.changed) {
            hooks.onSchemaChange({
                table: modelConfig.table,
                storedHash: checkResult.storedHash,
                currentHash: checkResult.currentHash,
            });
        }
        models[modelName] = new Model({ db, modelConfig }) as ModelsFor<T>[keyof T];
    });
    if (firstCreate) {
        hooks.onFirstCreate({ adapter, runner, models });
    }
    hooks.onModelsReady({ models });

    return models;
};
