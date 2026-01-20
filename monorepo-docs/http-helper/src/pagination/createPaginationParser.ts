import {
    type OrderDirection,
    OrderDirectionSchema,
    type PaginationConfig,
    PaginationConfigSchema,
    parseBooleanString,
} from '@repo/shared-types';
import { z } from 'zod';

type QueryValue = string | string[] | undefined;
type QueryRecord = Record<string, QueryValue>;

type BooleanParamOption = {
    defaultValue?: boolean;
    trueValues?: readonly string[];
    falseValues?: readonly string[];
    throwOnInvalid?: boolean;
};

export type PaginationParserOptions<TFields extends string, TBooleanKeys extends string = never> = {
    config: PaginationConfig<TFields, TBooleanKeys>;
    booleanParams?: Record<TBooleanKeys, BooleanParamOption>;
};

export type PaginationParserResult<TFields extends string, TBooleanKeys extends string = never> = {
    page: number;
    limit: number;
    orderBy: TFields;
    orderDir: OrderDirection;
} & Record<TBooleanKeys, boolean>;

const pickFirstValue = (value: QueryValue): string | undefined => {
    if (Array.isArray(value)) {
        return value[0];
    }

    return value;
};

const coerceNumber = (value: QueryValue, fallback: number): number => {
    const normalized = pickFirstValue(value);
    if (normalized === undefined) {
        return fallback;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const coerceOrderDir = (value: QueryValue, fallback: OrderDirection): OrderDirection => {
    const normalized = pickFirstValue(value);
    if (normalized === undefined) {
        return fallback;
    }

    const upperCased = normalized.toUpperCase();
    return upperCased === 'ASC' || upperCased === 'DESC' ? (upperCased as OrderDirection) : fallback;
};

const coerceOrderBy = <TFields extends string>(
    value: QueryValue,
    fallback: TFields,
    allowedFields: ReadonlySet<TFields>
): TFields => {
    const normalized = pickFirstValue(value);
    if (normalized === undefined) {
        return fallback;
    }

    return allowedFields.has(normalized as TFields) ? (normalized as TFields) : fallback;
};

const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
};

const coerceBooleanFlag = (value: QueryValue, option: BooleanParamOption): boolean => {
    return parseBooleanString(pickFirstValue(value), {
        defaultValue: option.defaultValue,
        trueValues: option.trueValues,
        falseValues: option.falseValues,
        throwOnInvalid: option.throwOnInvalid,
    });
};

export const createPaginationParser = <TFields extends string, TBooleanKeys extends string = never>({
    config,
    booleanParams,
}: PaginationParserOptions<TFields, TBooleanKeys>) => {
    PaginationConfigSchema.parse(config);

    const minLimit = config.minLimit ?? 1;
    const maxLimit = config.maxLimit ?? 100;
    const defaultLimit = config.defaultLimit ?? 10;
    const defaultPage = config.defaultPage ?? 1;
    const defaultOrderBy = config.sortableFields.default;
    const defaultOrderDir = config.sortableFields.defaultDir ?? 'DESC';
    const allowedOrderFields = config.sortableFields.fields;

    const allowedFieldsSet = new Set<TFields>(allowedOrderFields as readonly TFields[]);

    const pageSchema = z
        .preprocess((value) => coerceNumber(value as QueryValue, defaultPage), z.number().int().min(1))
        .default(defaultPage);

    const limitSchema = z
        .preprocess(
            (value) => clamp(coerceNumber(value as QueryValue, defaultLimit), minLimit, maxLimit),
            z.number().int().min(minLimit).max(maxLimit)
        )
        .default(clamp(defaultLimit, minLimit, maxLimit));

    const orderBySchema = z
        .preprocess(
            (value) => coerceOrderBy(value as QueryValue, defaultOrderBy, allowedFieldsSet),
            z.enum(allowedOrderFields)
        )
        .default(defaultOrderBy);

    const orderDirSchema = z
        .preprocess((value) => coerceOrderDir(value as QueryValue, defaultOrderDir), OrderDirectionSchema)
        .default(defaultOrderDir);

    const baseSchema = z.object({
        page: pageSchema,
        limit: limitSchema,
        orderBy: orderBySchema,
        orderDir: orderDirSchema,
    });

    return (query: QueryRecord = {} as QueryRecord): PaginationParserResult<TFields, TBooleanKeys> => {
        const parsed = baseSchema.parse({
            page: query.page,
            limit: query.limit,
            orderBy: query.orderBy,
            orderDir: query.orderDir,
        });

        if (!booleanParams) {
            return parsed as PaginationParserResult<TFields, TBooleanKeys>;
        }

        const booleanResults = {} as Record<TBooleanKeys, boolean>;

        for (const key of Object.keys(booleanParams) as TBooleanKeys[]) {
            const option = booleanParams[key];
            if (!option) {
                continue;
            }

            booleanResults[key] = coerceBooleanFlag(query[key], option);
        }

        return {
            ...parsed,
            ...booleanResults,
        };
    };
};
