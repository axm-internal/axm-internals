import type { SQLQueryBindings } from 'bun:sqlite';
import type { z } from 'zod';
import { modelConfigToTableSpec, tableSpecSignature } from '../sql/ddl/TableSqlGenerator';

export type SqlRunner = {
    run: (sql: string, params?: SQLQueryBindings[]) => void;
    query: (sql: string) => { get: (params?: SQLQueryBindings[]) => unknown };
};

export type SchemaHashCheckResult = {
    changed: boolean;
    storedHash: string;
    currentHash: string;
};

export const ensureMetaTable = (db: Pick<SqlRunner, 'run'>) => {
    db.run(
        'CREATE TABLE IF NOT EXISTS "__bun_record_db_meta" ("table_name" TEXT PRIMARY KEY, "schema_hash" TEXT NOT NULL)'
    );
};

export const isFirstCreate = (db: Pick<SqlRunner, 'query'>) => {
    const result = db.query('SELECT COUNT(*) as count FROM "__bun_record_db_meta"').get() as
        | { count: number }
        | undefined;
    return !result || result.count === 0;
};

export const checkSchemaHash = (
    db: Pick<SqlRunner, 'run' | 'query'>,
    modelConfig: { table: string; schema: z.ZodObject<z.ZodRawShape> }
): SchemaHashCheckResult => {
    const tableSpec = modelConfigToTableSpec(modelConfig);
    const hash = tableSpecSignature(tableSpec);
    const existing = db
        .query('SELECT "schema_hash" as schema_hash FROM "__bun_record_db_meta" WHERE "table_name" = ?')
        .get([modelConfig.table]) as { schema_hash: string } | undefined;

    if (!existing) {
        db.run('INSERT INTO "__bun_record_db_meta" ("table_name", "schema_hash") VALUES (?, ?)', [
            modelConfig.table,
            hash,
        ]);
        return { changed: false, storedHash: hash, currentHash: hash };
    }

    if (existing.schema_hash !== hash) {
        return { changed: true, storedHash: existing.schema_hash, currentHash: hash };
    }

    return { changed: false, storedHash: existing.schema_hash, currentHash: hash };
};
