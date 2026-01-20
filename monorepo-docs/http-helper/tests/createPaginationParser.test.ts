import { describe, expect, it } from 'bun:test';
import { createPaginationParser } from '../src';

describe('createPaginationParser', () => {
    const parser = createPaginationParser({
        config: {
            minLimit: 5,
            maxLimit: 50,
            defaultLimit: 25,
            defaultPage: 1,
            sortableFields: {
                fields: ['createdAt', 'collectedAt'],
                default: 'createdAt',
                defaultDir: 'DESC',
            },
        },
        booleanParams: {
            parsed: {
                defaultValue: true,
            },
        },
    });

    it('parses and clamps numeric query values', () => {
        const result = parser({
            page: '2',
            limit: '100',
        });

        expect(result.page).toBe(2);
        expect(result.limit).toBe(50);
    });

    it('falls back to defaults when provided with invalid numbers', () => {
        const result = parser({
            page: 'abc',
            limit: '-10',
        });

        expect(result.page).toBe(1);
        expect(result.limit).toBe(5);
    });

    it('restricts ordering to the allowed fields and directions', () => {
        const result = parser({
            orderBy: 'collectedAt',
            orderDir: 'asc',
        });

        expect(result.orderBy).toBe('collectedAt');
        expect(result.orderDir).toBe('ASC');

        const fallback = parser({
            orderBy: 'unsupported',
            orderDir: 'invalid',
        });

        expect(fallback.orderBy).toBe('createdAt');
        expect(fallback.orderDir).toBe('DESC');
    });

    it('parses configured boolean flags', () => {
        const showParsed = parser({
            parsed: 'true',
        });
        expect(showParsed.parsed).toBe(true);

        const hideParsed = parser({
            parsed: 'false',
        });
        expect(hideParsed.parsed).toBe(false);
    });
});
