import { describe, expect, it } from 'bun:test';
import type { PaginationConfig } from '@repo/shared-types';
import type { HonoRequest } from 'hono';
import { z } from 'zod';
import { createPaginationOptionsBuilder } from '../src';

type TestEntity = {
    id: number;
    slug: string;
    active: boolean;
    brand?: {
        slug?: string;
    };
    category?: string;
    parsed?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

type QueryRecord = Record<string, string | string[]>;

const createRequest = (queryRecord: QueryRecord): HonoRequest => {
    return {
        query: (key: string) => {
            const value = queryRecord[key];
            if (Array.isArray(value)) {
                return value[0];
            }
            return value;
        },
        queries: () => queryRecord,
    } as unknown as HonoRequest;
};

const CategorySchema = z.enum(['men', 'women']);

const TestPaginationConfig = {
    minLimit: 1,
    maxLimit: 50,
    defaultLimit: 10,
    defaultPage: 1,
    sortableFields: {
        fields: ['createdAt', 'updatedAt'] as const,
        default: 'createdAt',
        defaultDir: 'DESC',
    },
    queryableFields: [
        { param: 'slug' },
        { param: 'active', valueType: 'boolean' },
        { param: 'brandSlug', target: ['brand', 'slug'] as const },
        { param: 'category', schema: CategorySchema },
    ] as const,
} as const satisfies PaginationConfig<'createdAt' | 'updatedAt', 'slug' | 'active' | 'brandSlug' | 'category'>;

const DefaultBooleanConfig = {
    minLimit: 1,
    maxLimit: 25,
    defaultLimit: 5,
    defaultPage: 1,
    sortableFields: {
        fields: ['createdAt'] as const,
        default: 'createdAt',
        defaultDir: 'DESC',
    },
    queryableFields: [
        {
            param: 'parsed',
            valueType: 'boolean',
            defaultValue: true,
        },
    ] as const,
} as const satisfies PaginationConfig<'createdAt', 'parsed'>;

describe('createPaginationOptionsBuilder', () => {
    it('builds pagination options with nested filters', () => {
        const buildPagination = createPaginationOptionsBuilder<
            TestEntity,
            'createdAt' | 'updatedAt',
            'slug' | 'active' | 'brandSlug' | 'category'
        >(TestPaginationConfig);
        const req = createRequest({
            page: '2',
            limit: '5',
            orderBy: 'updatedAt',
            orderDir: 'ASC',
            slug: 'alpha',
            active: 'true',
            brandSlug: 'nike',
        });

        const options = buildPagination(req);
        expect(options.page).toEqual(2);
        expect(options.limit).toEqual(5);
        expect(options.order).toEqual({ updatedAt: 'ASC' });
        expect(options.where).toEqual({
            slug: 'alpha',
            active: true,
            brand: {
                slug: 'nike',
            },
        });
    });

    it('applies default values and validates schema-backed inputs', () => {
        const buildPagination = createPaginationOptionsBuilder<TestEntity, 'createdAt', 'parsed'>(DefaultBooleanConfig);
        const options = buildPagination(createRequest({}));
        expect(options.where).toEqual({
            parsed: true,
        });
    });

    it('drops query values that fail schema validation', () => {
        const buildPagination = createPaginationOptionsBuilder<
            TestEntity,
            'createdAt' | 'updatedAt',
            'slug' | 'active' | 'brandSlug' | 'category'
        >(TestPaginationConfig);

        const invalid = buildPagination(createRequest({ category: 'kids' }));
        expect(invalid.where).toEqual(undefined);

        const valid = buildPagination(createRequest({ category: 'women' }));
        expect(valid.where).toEqual({
            category: 'women',
        });
    });
});
