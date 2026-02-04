import { and, asc, desc, eq, type SQL, sql } from 'drizzle-orm';
import type { AnySQLiteTable } from 'drizzle-orm/sqlite-core';
import { getTableColumns } from 'drizzle-orm/utils';
import { z } from 'zod';
import { getPrimaryKeyField, isAutoIncrement, isNullable } from '../schema/meta';
import { PaginationQuerySchema, WriteOptionsSchema } from '../schema/schemas';
import { modelConfigToDrizzleTable } from '../sql/dml/drizzle-adapter';
import type {
    AnySQLiteDb,
    InsertInput,
    InsertOptions,
    ModelConfig,
    OrderBy,
    PaginationQuery,
    UpdateOptions,
    Where,
} from '../types';

export type ModelConfigFor<TSchema extends z.ZodObject<z.ZodRawShape>> = Omit<ModelConfig, 'schema'> & {
    schema: TSchema;
};

export type ModelParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    db: AnySQLiteDb;
    modelConfig: ModelConfigFor<TSchema>;
};

type ModelData<TSchema extends z.ZodObject<z.ZodRawShape>> = z.infer<TSchema>;

type FindByIdParams = {
    id: string | number;
};

type FindOneParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    where: Where<ModelData<TSchema>>;
    orderBy?: OrderBy<ModelData<TSchema>>;
};

type FindManyParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    where?: Where<ModelData<TSchema>>;
    orderBy?: OrderBy<ModelData<TSchema>>;
    limit?: number;
};

type FindPaginatedParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    where?: Where<ModelData<TSchema>>;
    orderBy?: OrderBy<ModelData<TSchema>>;
    pagination?: PaginationQuery;
};

type ExistsParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    where: Where<ModelData<TSchema>>;
};

type CountParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    where?: Where<ModelData<TSchema>>;
};

type SaveParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    data: InsertInput<TSchema>;
    validate?: InsertOptions['validate'];
};

type SaveManyParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    data: InsertInput<TSchema>[];
    validate?: InsertOptions['validate'];
};

type UpdateParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    where: Where<ModelData<TSchema>>;
    data: Partial<ModelData<TSchema>>;
    validate?: UpdateOptions['validate'];
};

type UpsertParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    where: Where<ModelData<TSchema>>;
    data: InsertInput<TSchema>;
    validate?: InsertOptions['validate'];
};

type RemoveParams<TSchema extends z.ZodObject<z.ZodRawShape>> = {
    where: Where<ModelData<TSchema>>;
};

export class Model<TSchema extends z.ZodObject<z.ZodRawShape>> {
    protected primaryKeyColumn: string | null;
    protected modelConfig: ModelConfigFor<TSchema>;
    protected sqliteTable: AnySQLiteTable;
    protected db: AnySQLiteDb;
    protected columns: ReturnType<typeof getTableColumns>;
    private insertSchema?: z.ZodObject<z.ZodRawShape>;
    private updateSchema?: z.ZodObject<z.ZodRawShape>;

    // Drizzle query builder types are too strict for dynamic filters; keep
    // a narrow helper to avoid explicit any at call sites.
    private selectFromTable() {
        return this.db.select().from(this.sqliteTable) as unknown as {
            where: (clause: SQL) => void;
            orderBy: (...clauses: SQL[]) => void;
            limit: (value: number) => void;
            offset: (value: number) => void;
            get: () => unknown;
            all: () => unknown[];
        };
    }

    private selectValue<TResult>(fields: Record<string, SQL | SQL.Aliased>) {
        return this.db.select(fields).from(this.sqliteTable) as unknown as {
            where: (clause: SQL) => void;
            limit: (value: number) => void;
            get: () => TResult | undefined;
        };
    }

    private applyWhereOrder(
        query: { where: (clause: SQL) => void; orderBy: (...clauses: SQL[]) => void },
        params: {
            where?: Where<ModelData<TSchema>>;
            orderBy?: OrderBy<ModelData<TSchema>>;
        }
    ) {
        const whereSql = this.buildWhere(params.where);
        const orderSql = this.buildOrderBy(params.orderBy);
        if (whereSql) {
            query.where(whereSql);
        }
        if (orderSql?.length) {
            query.orderBy(...orderSql);
        }
    }

    constructor({ db, modelConfig }: ModelParams<TSchema>) {
        this.db = db;
        this.modelConfig = modelConfig;
        this.sqliteTable = modelConfigToDrizzleTable(modelConfig);
        this.primaryKeyColumn = getPrimaryKeyField(this.modelConfig.schema);
        this.columns = getTableColumns(this.sqliteTable);
    }

    findById({ id }: FindByIdParams): ModelData<TSchema> | null {
        if (!this.primaryKeyColumn) {
            return null;
        }
        const where = this.buildWhere({ [this.primaryKeyColumn]: id } as Where<ModelData<TSchema>>);
        const query = this.selectFromTable();
        if (where) {
            query.where(where);
        }
        query.limit(1);
        return (query.get() as ModelData<TSchema> | undefined) ?? null;
    }

    findOne({ where, orderBy }: FindOneParams<TSchema>): ModelData<TSchema> | null {
        const query = this.selectFromTable();
        this.applyWhereOrder(query, { where, orderBy });
        query.limit(1);
        return (query.get() as ModelData<TSchema> | undefined) ?? null;
    }

    findMany({ where, orderBy, limit }: FindManyParams<TSchema> = {}): ModelData<TSchema>[] {
        const query = this.selectFromTable();
        this.applyWhereOrder(query, { where, orderBy });
        if (limit) {
            query.limit(limit);
        }
        return query.all() as ModelData<TSchema>[];
    }

    findPaginated({ where, orderBy, pagination }: FindPaginatedParams<TSchema> = {}) {
        const resolvedPagination = PaginationQuerySchema.parse(pagination ?? {});
        const total = this.count({ where });
        const query = this.selectFromTable();
        this.applyWhereOrder(query, { where, orderBy });
        query.limit(resolvedPagination.limit);
        query.offset((resolvedPagination.page - 1) * resolvedPagination.limit);
        const items = query.all() as ModelData<TSchema>[];
        return {
            pagination: {
                page: resolvedPagination.page,
                pages: Math.max(1, Math.ceil(total / resolvedPagination.limit)),
                limit: resolvedPagination.limit,
            },
            items,
        };
    }

    exists({ where }: ExistsParams<TSchema>): boolean {
        const whereSql = this.buildWhere(where);
        const query = this.selectValue<{ value: number }>({ value: sql<number>`1`.as('value') });
        if (whereSql) {
            query.where(whereSql);
        }
        query.limit(1);
        const row = query.get();
        return Boolean(row);
    }

    count({ where }: CountParams<TSchema> = {}): number {
        const whereSql = this.buildWhere(where);
        const query = this.selectValue<{ count: number }>({ count: sql<number>`count(*)`.as('count') });
        if (whereSql) {
            query.where(whereSql);
        }
        const row = query.get();
        return row?.count ?? 0;
    }

    save({ data, validate }: SaveParams<TSchema>): ModelData<TSchema> {
        const parsed = this.validateInsert(data as Record<string, unknown>, validate);
        const inserted = this.insertOne(parsed);
        if (!inserted) {
            throw new Error('Insert failed');
        }
        return inserted;
    }

    saveMany({ data, validate }: SaveManyParams<TSchema>): ModelData<TSchema>[] {
        return data.map((row) => this.save({ data: row, validate }));
    }

    update({ where, data, validate }: UpdateParams<TSchema>): number {
        if (!where || Object.keys(where).length === 0) {
            throw new Error('update requires a where clause');
        }
        const parsed = this.validateUpdate(data as Record<string, unknown>, validate);
        const whereSql = this.buildWhere(where);
        if (!whereSql) {
            return 0;
        }
        const rows = this.db
            .update(this.sqliteTable)
            .set(parsed as Record<string, unknown>)
            .where(whereSql)
            .returning()
            .all();
        return rows.length;
    }

    upsert({ where, data, validate }: UpsertParams<TSchema>): ModelData<TSchema> {
        const existing = this.findOne({ where });
        if (existing) {
            this.update({ where, data: data as Partial<ModelData<TSchema>>, validate });
            return this.findOne({ where }) as ModelData<TSchema>;
        }
        return this.save({ data, validate });
    }

    remove({ where }: RemoveParams<TSchema>): number {
        if (!where || Object.keys(where).length === 0) {
            throw new Error('remove requires a where clause');
        }
        const whereSql = this.buildWhere(where);
        if (!whereSql) {
            return 0;
        }
        const rows = this.db.delete(this.sqliteTable).where(whereSql).returning().all();
        return rows.length;
    }

    removeMany({ where }: RemoveParams<TSchema>): number {
        return this.remove({ where });
    }

    private validateInsert<TInput extends Record<string, unknown>>(data: TInput, validate?: InsertOptions['validate']) {
        return this.validateWithSchema(data, validate, () => this.getInsertSchema());
    }

    private validateUpdate<TInput extends Record<string, unknown>>(data: TInput, validate?: UpdateOptions['validate']) {
        return this.validateWithSchema(data, validate, () => this.getUpdateSchema());
    }

    private validateWithSchema<TInput extends Record<string, unknown>>(
        data: TInput,
        validate: InsertOptions['validate'] | UpdateOptions['validate'],
        fallbackSchema: () => z.ZodType
    ): TInput {
        const parsedOptions = WriteOptionsSchema.parse({ validate });
        if (parsedOptions.validate === false) {
            return data;
        }
        if (parsedOptions.validate) {
            const result = parsedOptions.validate.safeParse(data);
            if (!result.success) {
                throw result.error;
            }
            return result.data as TInput;
        }
        const result = fallbackSchema().safeParse(data);
        if (!result.success) {
            throw result.error;
        }
        return result.data as TInput;
    }

    private insertOne(data: Record<string, unknown>): ModelData<TSchema> | null {
        const row = this.db.insert(this.sqliteTable).values(data).returning().get();
        return (row as ModelData<TSchema> | undefined) ?? null;
    }

    private getInsertSchema(): z.ZodObject<z.ZodRawShape> {
        if (this.insertSchema) {
            return this.insertSchema;
        }
        const shape = this.modelConfig.schema.shape as z.ZodRawShape;
        const nextShape: Record<string, z.ZodType> = {};
        for (const [field, fieldSchema] of Object.entries(shape)) {
            const schema = fieldSchema as z.ZodType;
            const baseSchema = schema instanceof z.ZodPipe ? (schema.in as z.ZodType) : schema;
            const optional = isAutoIncrement(baseSchema) || isNullable(schema) || baseSchema instanceof z.ZodDefault;
            nextShape[field] = optional ? schema.optional() : schema;
        }
        this.insertSchema = z.object(nextShape);
        return this.insertSchema;
    }

    private getUpdateSchema(): z.ZodObject<z.ZodRawShape> {
        if (this.updateSchema) {
            return this.updateSchema;
        }
        this.updateSchema = this.modelConfig.schema.partial();
        return this.updateSchema;
    }

    private buildWhere(where?: Where<ModelData<TSchema>>): SQL | undefined {
        if (!where || Object.keys(where).length === 0) {
            return undefined;
        }
        const clauses = Object.entries(where).map(([field, value]) => {
            const column = this.columns[field];
            if (!column) {
                throw new Error(`Unknown column "${field}" for table "${this.modelConfig.table}"`);
            }
            return eq(column, value as never);
        });
        return clauses.length === 1 ? clauses[0] : and(...clauses);
    }

    private buildOrderBy(orderBy?: OrderBy<ModelData<TSchema>>): SQL[] | undefined {
        if (!orderBy || orderBy.length === 0) {
            return undefined;
        }
        return orderBy.map((item) => {
            const column = this.columns[String(item.field)];
            if (!column) {
                throw new Error(`Unknown column "${String(item.field)}" for table "${this.modelConfig.table}"`);
            }
            return item.direction === 'desc' ? desc(column) : asc(column);
        });
    }
}
