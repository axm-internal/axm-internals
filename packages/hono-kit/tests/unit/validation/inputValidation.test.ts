import { describe, expect, it } from 'bun:test';
import { z } from 'zod';

import { formatValidationPath, ValidationError, validateInput } from '../../../src/index';

describe('formatValidationPath', () => {
    it('formats nested object paths', () => {
        expect(formatValidationPath('body', ['user', 'email'])).toBe('body.user.email');
    });

    it('formats array paths', () => {
        expect(formatValidationPath('body', ['items', 2, 'sku'])).toBe('body.items[2].sku');
    });
});

describe('validateInput', () => {
    it('returns parsed data when valid', () => {
        const schema = z.object({ id: z.string() });
        const result = validateInput({
            source: 'params',
            schema,
            value: { id: 'abc' },
        });

        expect(result).toEqual({ id: 'abc' });
    });

    it('throws ValidationError with formatted paths', () => {
        const schema = z.object({
            user: z.object({ email: z.string().email() }),
            items: z.array(z.object({ sku: z.string().min(1) })),
        });

        expect(() =>
            validateInput({
                source: 'body',
                schema,
                value: { user: { email: 'nope' }, items: [{ sku: '' }, { sku: '' }] },
            })
        ).toThrow(ValidationError);

        try {
            validateInput({
                source: 'body',
                schema,
                value: { user: { email: 'nope' }, items: [{ sku: '' }, { sku: '' }] },
            });
        } catch (error) {
            const validationError = error as ValidationError;
            expect(validationError.validationErrors[0]?.path).toBe('body.user.email');
            expect(validationError.validationErrors[1]?.path).toBe('body.items[0].sku');
        }
    });
});
