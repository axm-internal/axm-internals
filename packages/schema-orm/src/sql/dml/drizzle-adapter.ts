import { type SQL, sql } from 'drizzle-orm';
import type { AnySQLiteColumn, AnySQLiteTable } from 'drizzle-orm/sqlite-core';
import { blob, integer, numeric, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { ModelConfig, OrderBy, PaginationQuery, Where, WhereOperator } from '../../types';
import { type ColumnSpec, modelConfigToTableSpec, type TableSpec } from '../ddl/TableSqlGenerator';

type ColumnBuilder =
    | ReturnType<typeof integer>
    | ReturnType<typeof real>
    | ReturnType<typeof text>
    | ReturnType<typeof blob>
    | ReturnType<typeof numeric>;

const columnSpecToBuilder = (columnSpec: ColumnSpec, compositePKSet?: Set<string>): ColumnBuilder => {
    let builder: ColumnBuilder;

    switch (columnSpec.type) {
        case 'INTEGER':
            if (columnSpec.logicalType === 'date') {
                builder = integer(columnSpec.name, { mode: 'timestamp_ms' });
            } else if (columnSpec.logicalType === 'boolean') {
                builder = integer(columnSpec.name, { mode: 'boolean' });
            } else {
                builder = integer(columnSpec.name);
            }
            break;
        case 'REAL':
            builder = real(columnSpec.name);
            break;
        case 'TEXT':
            builder =
                columnSpec.logicalType === 'json' ? text(columnSpec.name, { mode: 'json' }) : text(columnSpec.name);
            break;
        case 'BLOB':
            builder = blob(columnSpec.name);
            break;
        case 'NUMERIC':
            builder = numeric(columnSpec.name);
            break;
    }

    const isInCompositePK = compositePKSet?.has(columnSpec.name);
    if (columnSpec.primaryKey && !isInCompositePK) {
        builder = builder.primaryKey({ autoIncrement: columnSpec.autoincrement });
    }

    if (columnSpec.notNull) {
        builder = builder.notNull();
    }

    if (columnSpec.unique && !columnSpec.primaryKey) {
        builder = builder.unique();
    }

    if (columnSpec.default !== null && columnSpec.default !== undefined) {
        builder = builder.default(columnSpec.default);
    }

    return builder;
};

export const tableSpecToDrizzleTable = (tableSpec: TableSpec): AnySQLiteTable => {
    const compositePKSet = tableSpec.compositePrimaryKeys ? new Set(tableSpec.compositePrimaryKeys) : undefined;
    const columns: Record<string, ColumnBuilder> = {};

    for (const columnSpec of tableSpec.columns) {
        columns[columnSpec.name] = columnSpecToBuilder(columnSpec, compositePKSet);
    }

    if (tableSpec.compositePrimaryKeys && tableSpec.compositePrimaryKeys.length > 1) {
        const pkNames = tableSpec.compositePrimaryKeys;
        return sqliteTable(tableSpec.table, columns, (table) => [
            primaryKey(...pkNames.map((name) => table[name] as AnySQLiteColumn)),
        ]) as AnySQLiteTable;
    }

    return sqliteTable(tableSpec.table, columns);
};

export const modelConfigToDrizzleTable = (modelConfig: ModelConfig): AnySQLiteTable => {
    const tableSpec = modelConfigToTableSpec(modelConfig);
    return tableSpecToDrizzleTable(tableSpec);
};

const isOperatorObject = (value: unknown): value is WhereOperator<unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const buildWhereClauseSql = (field: string, value: unknown): SQL => {
    if (value === null) {
        return sql`${sql.identifier(field)} IS NULL`;
    }
    if (value === undefined || !isOperatorObject(value)) {
        return sql`${sql.identifier(field)} = ${value}`;
    }
    if ('eq' in value) return sql`${sql.identifier(field)} = ${value.eq}`;
    if ('ne' in value) return sql`${sql.identifier(field)} != ${value.ne}`;
    if ('gt' in value) return sql`${sql.identifier(field)} > ${value.gt}`;
    if ('gte' in value) return sql`${sql.identifier(field)} >= ${value.gte}`;
    if ('lt' in value) return sql`${sql.identifier(field)} < ${value.lt}`;
    if ('lte' in value) return sql`${sql.identifier(field)} <= ${value.lte}`;
    if ('like' in value) return sql`${sql.identifier(field)} LIKE ${value.like}`;
    if ('notLike' in value) return sql`${sql.identifier(field)} NOT LIKE ${value.notLike}`;
    if ('in' in value) {
        const values = value.in as unknown[];
        if (values.length === 0) {
            return sql`1 = 0`;
        }
        const items = values.map((v) => sql`${v}`);
        return sql`${sql.identifier(field)} IN (${sql.join(items, sql`, `)})`;
    }
    if ('notIn' in value) {
        const values = value.notIn as unknown[];
        if (values.length === 0) {
            return sql`1 = 1`;
        }
        const items = values.map((v) => sql`${v}`);
        return sql`${sql.identifier(field)} NOT IN (${sql.join(items, sql`, `)})`;
    }
    if ('isNull' in value) {
        return value.isNull ? sql`${sql.identifier(field)} IS NULL` : sql`${sql.identifier(field)} IS NOT NULL`;
    }
    if ('between' in value) {
        const [min, max] = value.between as [unknown, unknown];
        return sql`${sql.identifier(field)} BETWEEN ${min} AND ${max}`;
    }
    if ('notBetween' in value) {
        const [min, max] = value.notBetween as [unknown, unknown];
        return sql`${sql.identifier(field)} NOT BETWEEN ${min} AND ${max}`;
    }
    return sql`${sql.identifier(field)} = ${value}`;
};

const buildWhereSql = <T extends Record<string, unknown>>(where?: Where<T>): SQL | undefined => {
    if (!where || Object.keys(where).length === 0) {
        return undefined;
    }
    const clauses = Object.entries(where).map(([field, value]) => buildWhereClauseSql(field, value));
    return clauses.length === 1 ? (clauses[0] as SQL) : sql.join(clauses, sql` AND `);
};

const buildOrderBySql = <T extends Record<string, unknown>>(orderBy?: OrderBy<T>): SQL | undefined => {
    if (!orderBy || orderBy.length === 0) {
        return undefined;
    }
    const parts = orderBy.map(
        (item) => sql`${sql.identifier(String(item.field))} ${sql.raw(item.direction.toUpperCase())}`
    );
    return sql.join(parts, sql`, `);
};

const buildPaginationSql = (pagination?: PaginationQuery): SQL | undefined => {
    if (!pagination) {
        return undefined;
    }
    const offset = (pagination.page - 1) * pagination.limit;
    return sql`LIMIT ${pagination.limit} OFFSET ${offset}`;
};

export const buildSelect = <T extends Record<string, unknown>>(params: {
    table: string;
    where?: Where<T>;
    orderBy?: OrderBy<T>;
    limit?: number;
    pagination?: PaginationQuery;
}): SQL => {
    if (params.limit !== undefined && params.pagination) {
        throw new Error('limit and pagination cannot be used together');
    }
    const base = sql`SELECT * FROM ${sql.identifier(params.table)}`;
    const whereSql = buildWhereSql(params.where);
    const orderSql = buildOrderBySql(params.orderBy);
    const limitSql = params.limit ? sql`LIMIT ${params.limit}` : undefined;
    const paginationSql = buildPaginationSql(params.pagination);

    const parts = [base];
    if (whereSql) parts.push(sql`WHERE ${whereSql}`);
    if (orderSql) parts.push(sql`ORDER BY ${orderSql}`);
    if (limitSql) parts.push(limitSql);
    if (paginationSql) parts.push(paginationSql);

    return sql.join(parts, sql` `);
};

export const buildCount = <T extends Record<string, unknown>>(params: { table: string; where?: Where<T> }): SQL => {
    const base = sql`SELECT COUNT(*) as count FROM ${sql.identifier(params.table)}`;
    const whereSql = buildWhereSql(params.where);
    return whereSql ? sql.join([base, sql`WHERE ${whereSql}`], sql` `) : base;
};

export const buildExists = <T extends Record<string, unknown>>(params: { table: string; where: Where<T> }): SQL => {
    const whereSql = buildWhereSql(params.where);
    return sql`SELECT 1 as value FROM ${sql.identifier(params.table)} WHERE ${whereSql} LIMIT 1`;
};

export const buildInsert = (params: { table: string; data: Record<string, unknown> }): SQL => {
    const columns = Object.keys(params.data);
    if (columns.length === 0) {
        throw new Error('insert data must not be empty');
    }
    const columnSql = sql.join(
        columns.map((c) => sql.identifier(c)),
        sql`, `
    );
    const valuesSql = sql.join(
        columns.map((c) => sql`${params.data[c]}`),
        sql`, `
    );
    return sql`INSERT INTO ${sql.identifier(params.table)} (${columnSql}) VALUES (${valuesSql}) RETURNING *`;
};

export const buildUpdate = <T extends Record<string, unknown>>(params: {
    table: string;
    where: Where<T>;
    data: Record<string, unknown>;
}): SQL => {
    const entries = Object.entries(params.data);
    if (entries.length === 0) {
        throw new Error('update data must not be empty');
    }
    const setSql = sql.join(
        entries.map(([field, value]) => sql`${sql.identifier(field)} = ${value}`),
        sql`, `
    );
    const whereSql = buildWhereSql(params.where);
    return sql`UPDATE ${sql.identifier(params.table)} SET ${setSql} WHERE ${whereSql} RETURNING *`;
};

export const buildDelete = <T extends Record<string, unknown>>(params: { table: string; where: Where<T> }): SQL => {
    const whereSql = buildWhereSql(params.where);
    if (!whereSql) {
        throw new Error('delete where must not be empty');
    }
    return sql`DELETE FROM ${sql.identifier(params.table)} WHERE ${whereSql} RETURNING *`;
};
