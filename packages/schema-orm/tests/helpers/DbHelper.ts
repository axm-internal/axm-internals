import type { SQLQueryBindings } from 'bun:sqlite';
import type { SqlRunner } from '../../src/db/schema-metadata';
import { generateCreateTable } from '../../src/sql/ddl/TableSqlGenerator';
import { modelFixtures } from '../fixtures';

export const resetTables = (runner: SqlRunner) => {
    truncateTestTables(runner);
    seedTestTables(runner);
};

export const createTestTables = (runner: SqlRunner) => {
    for (const fixture of Object.values(modelFixtures)) {
        const sql = generateCreateTable(fixture.modelConfig);
        runner.run(sql);
    }
};

export const seedTestTables = (runner: SqlRunner) => {
    for (const fixture of Object.values(modelFixtures)) {
        const table = fixture.modelConfig.table;
        const rows = fixture.rows as Record<string, SQLQueryBindings>[];
        const firstRow = rows[0];
        if (!firstRow) {
            throw new Error(`No rows in ${table} fixture`);
        }
        const columns = Object.keys(firstRow);
        const placeholders = columns.map(() => '?').join(', ');
        const sql = `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(', ')})
                     VALUES (${placeholders})`;
        for (const row of rows) {
            const values = columns.map((c) => {
                const value = row[c];
                if (value === undefined) {
                    throw new Error(`Missing value for column "${c}" in ${table} fixture`);
                }
                return value;
            });
            runner.run(sql, values);
        }
    }
};

const truncateTestTables = (runner: SqlRunner) => {
    for (const fixture of Object.values(modelFixtures)) {
        const table = fixture.modelConfig.table;
        runner.run(`DELETE FROM "${table}"`);
        runner.run('DELETE FROM sqlite_sequence WHERE name = ?', [table]);
    }
};
