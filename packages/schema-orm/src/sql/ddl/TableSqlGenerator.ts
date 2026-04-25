import * as z from 'zod';
import {
    getDefault,
    getForeignKey,
    getPrimaryKeyFields,
    isAutoIncrement,
    isJsonColumn,
    isNullable,
    isPrimaryKey,
    isUnique,
} from '../../schema/meta';
import type { ModelConfig } from '../../types';

export type ColumnType = 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB' | 'NUMERIC';
export type ColumnLogicalType = 'date' | 'boolean' | 'json';

export type ColumnSpec = {
    name: string;
    type: ColumnType;
    logicalType?: ColumnLogicalType;
    primaryKey: boolean;
    autoincrement: boolean;
    notNull: boolean;
    unique: boolean;
    isJson: boolean;
    default: string | number | boolean | null;
    references?: { table: string; column: string };
};

export type TableSpec = {
    table: string;
    columns: ColumnSpec[];
    compositePrimaryKeys?: string[];
};

const escapeSqlString = (value: string) => value.replace(/'/g, "''");

function unwrapSchema(schema: z.ZodType): z.ZodType {
    // Unwrap common wrappers
    if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable || schema instanceof z.ZodDefault) {
        return unwrapSchema(schema.unwrap() as z.ZodType);
    }
    if (schema instanceof z.ZodPipe) {
        return unwrapSchema(schema.in as z.ZodType);
    }
    return schema;
}

function zodTypeToColumnSpecType(schema: z.ZodType): { columnType: ColumnType; logicalType?: ColumnLogicalType } {
    const unwrapped = unwrapSchema(schema);

    // Union handling (strict)
    if (unwrapped instanceof z.ZodUnion) {
        const types = unwrapped.options.map((option) => zodTypeToColumnSpecType(option as z.ZodType));
        const signatures = types.map((type) => JSON.stringify(type));
        const unique = new Set(signatures);
        if (unique.size === 1) {
            const first = types[0];
            if (!first) {
                throw new Error('Unsupported union mapping: no options provided');
            }
            return first;
        }
        throw new Error(`Unsupported union mapping: ${Array.from(unique).join(', ')}`);
    }

    const stringLike = new Set(['ZodEmail', 'ZodURL', 'ZodUrl', 'ZodUUID']);
    if (unwrapped instanceof z.ZodString || stringLike.has(unwrapped.constructor.name)) {
        return { columnType: 'TEXT' };
    }

    switch (true) {
        case unwrapped instanceof z.ZodNumber:
            return { columnType: unwrapped.format?.includes('int') ? 'INTEGER' : 'REAL' };
        case unwrapped instanceof z.ZodBoolean:
            return { columnType: 'INTEGER', logicalType: 'boolean' };
        case unwrapped instanceof z.ZodDate:
            return { columnType: 'INTEGER', logicalType: 'date' };
        case unwrapped instanceof z.ZodBigInt:
            return { columnType: 'INTEGER' };
        case unwrapped instanceof z.ZodEnum:
            return { columnType: 'TEXT' };
        case unwrapped instanceof z.ZodLiteral: {
            const value = unwrapped.value;
            if (typeof value === 'number') return { columnType: Number.isInteger(value) ? 'INTEGER' : 'REAL' };
            if (typeof value === 'boolean') return { columnType: 'INTEGER', logicalType: 'boolean' };
            if (typeof value === 'string') return { columnType: 'TEXT' };
            if (typeof value === 'bigint') return { columnType: 'INTEGER' };
            return { columnType: 'TEXT' };
        }
        case unwrapped instanceof z.ZodArray:
        case unwrapped instanceof z.ZodObject:
            if (isJsonColumn(schema)) {
                return { columnType: 'TEXT', logicalType: 'json' };
            }
            throw new Error('Zod object/array columns must be marked with makeJson(...)');
        default:
            throw new Error(`Unsupported Zod schema for column mapping: ${unwrapped.constructor.name}`);
    }
}

export function modelConfigToTableSpec(modelConfig: ModelConfig): TableSpec {
    const tableSpec: TableSpec = {
        table: modelConfig.table,
        columns: [],
    };

    const pkFields = getPrimaryKeyFields(modelConfig.schema);

    for (const [columnName, columnSchema] of Object.entries(modelConfig.schema.shape)) {
        const columnSpecType = zodTypeToColumnSpecType(columnSchema);
        const columnSpec: ColumnSpec = {
            name: columnName,
            type: columnSpecType.columnType,
            logicalType: columnSpecType.logicalType,
            primaryKey: isPrimaryKey(columnSchema),
            autoincrement: isAutoIncrement(columnSchema),
            notNull: !isNullable(columnSchema),
            isJson: isJsonColumn(columnSchema),
            unique: isUnique(columnSchema),
            default: getDefault(columnSchema),
            references: getForeignKey(columnSchema) ?? undefined,
        };
        tableSpec.columns.push(columnSpec);
    }

    if (pkFields.length > 1) {
        tableSpec.compositePrimaryKeys = pkFields;
    }

    return tableSpec;
}

function columnSpecToString(columnSpec: ColumnSpec, isPartOfCompositePK: boolean = false): string {
    const columnParts: string[] = [];
    columnParts.push(`"${columnSpec.name}"`);
    columnParts.push(`${columnSpec.type}`);
    if (columnSpec.primaryKey && !isPartOfCompositePK) {
        columnParts.push('PRIMARY KEY');
    }
    if (columnSpec.autoincrement && columnSpec.primaryKey && columnSpec.type === 'INTEGER' && !isPartOfCompositePK) {
        columnParts.push('AUTOINCREMENT');
    }
    if (columnSpec.notNull) {
        columnParts.push('NOT NULL');
    }
    if (columnSpec.unique && !columnSpec.primaryKey) {
        columnParts.push('UNIQUE');
    }
    if (columnSpec.default !== null && columnSpec.default !== undefined) {
        if (columnSpec.type === 'TEXT') {
            const escaped = escapeSqlString(String(columnSpec.default));
            columnParts.push(`DEFAULT '${escaped}'`);
        } else {
            columnParts.push(`DEFAULT ${columnSpec.default}`);
        }
    }
    if (columnSpec.references) {
        columnParts.push(`REFERENCES "${columnSpec.references.table}" ("${columnSpec.references.column}")`);
    }

    return columnParts.join(' ');
}

function tableSpecToCreateTable(tableSpec: TableSpec): string {
    const compositePKSet = tableSpec.compositePrimaryKeys ? new Set(tableSpec.compositePrimaryKeys) : new Set<string>();

    const columns = tableSpec.columns.map((col) => columnSpecToString(col, compositePKSet.has(col.name))).join(', ');

    const constraints: string[] = [];
    if (tableSpec.compositePrimaryKeys && tableSpec.compositePrimaryKeys.length > 1) {
        const pkCols = tableSpec.compositePrimaryKeys.map((c) => `"${c}"`).join(', ');
        constraints.push(`PRIMARY KEY (${pkCols})`);
    }

    const allParts = constraints.length > 0 ? `${columns}, ${constraints.join(', ')}` : columns;
    return `CREATE TABLE IF NOT EXISTS "${tableSpec.table}" (${allParts});`;
}

export function generateCreateTable(modelConfig: ModelConfig): string {
    const tableSpec = modelConfigToTableSpec(modelConfig);
    return tableSpecToCreateTable(tableSpec);
}

export function tableSpecSignature(tableSpec: TableSpec): string {
    const normalized = {
        table: tableSpec.table,
        columns: [...tableSpec.columns]
            .map((column) => ({
                name: column.name,
                type: column.type,
                primaryKey: column.primaryKey,
                autoincrement: column.autoincrement,
                notNull: column.notNull,
                unique: column.unique,
                default: column.default,
                references: column.references ?? null,
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        compositePrimaryKeys: tableSpec.compositePrimaryKeys ?? [],
    };

    const json = JSON.stringify(normalized);
    return Bun.hash(json).toString(16);
}
