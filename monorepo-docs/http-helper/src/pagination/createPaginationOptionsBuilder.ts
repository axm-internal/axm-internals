import {
    type PaginationConfig,
    PaginationConfigSchema,
    type PaginationOptions,
    type QueryableFieldConfig,
} from '@repo/shared-types';
import type { HonoRequest } from 'hono';
import { ReadQueryParams } from '../utils/ReadQueryParams';
import { createPaginationParser } from './createPaginationParser';

type QueryableFieldValue = string | number | boolean | undefined;

const ensurePathSegments = (field: QueryableFieldConfig): string[] => {
    if (!field.target) {
        return [field.param];
    }

    if (typeof field.target === 'string') {
        return field.target
            .split('.')
            .map((segment) => segment.trim())
            .filter((segment) => segment.length > 0);
    }

    return field.target.map((segment) => segment.trim()).filter((segment) => segment.length > 0);
};

const assignNestedValue = (target: Record<string, unknown>, path: string[], value: unknown): void => {
    if (path.length === 0) {
        return;
    }

    let cursor = target;
    for (let index = 0; index < path.length - 1; index += 1) {
        const key = path[index];
        if (!key) {
            continue;
        }

        const next = cursor[key];
        if (typeof next === 'object' && next !== null && !Array.isArray(next)) {
            cursor = next as Record<string, unknown>;
            continue;
        }

        const nested: Record<string, unknown> = {};
        cursor[key] = nested;
        cursor = nested;
    }

    const lastKey = path[path.length - 1];
    if (!lastKey) {
        return;
    }

    cursor[lastKey] = value as never;
};

const readQueryValue = (req: HonoRequest, field: QueryableFieldConfig): QueryableFieldValue => {
    const defaultValue = field.defaultValue;

    switch (field.valueType) {
        case 'boolean':
            return ReadQueryParams.readBoolean(req, field.param, defaultValue as boolean | undefined);
        case 'number':
            return ReadQueryParams.readNumber(req, field.param, defaultValue as number | undefined);
        case 'int':
            return ReadQueryParams.readInt(req, field.param, defaultValue as number | undefined);
        default:
            return ReadQueryParams.readString(req, field.param, defaultValue as string | undefined);
    }
};

const buildWhereClause = (
    req: HonoRequest,
    fields?: readonly QueryableFieldConfig[]
): Record<string, unknown> | undefined => {
    if (!fields || fields.length === 0) {
        return undefined;
    }

    const where: Record<string, unknown> = {};

    for (const field of fields) {
        const path = ensurePathSegments(field);
        if (path.length === 0) {
            continue;
        }

        let value = readQueryValue(req, field);
        if (value === undefined) {
            continue;
        }

        if (field.schema) {
            const result = field.schema.safeParse(value);
            if (!result.success) {
                continue;
            }

            value = result.data as QueryableFieldValue;
        }

        assignNestedValue(where, path, value);
    }

    return Object.keys(where).length > 0 ? where : undefined;
};

export const createPaginationOptionsBuilder = <
    Entity,
    TSortableField extends string = string,
    TQueryParam extends string = never,
>(
    config: PaginationConfig<TSortableField, TQueryParam>
) => {
    PaginationConfigSchema.parse(config);

    const parsePagination = createPaginationParser({ config });

    return (req: HonoRequest): PaginationOptions<Entity> => {
        const { page, limit, orderBy, orderDir } = parsePagination(req.queries());
        const where = buildWhereClause(req, config.queryableFields);

        const paginationOptions: PaginationOptions<Entity> = {
            page,
            limit,
            order: {
                [orderBy]: orderDir,
            } as PaginationOptions<Entity>['order'],
        };

        if (where) {
            paginationOptions.where = where as PaginationOptions<Entity>['where'];
        }

        return paginationOptions;
    };
};
