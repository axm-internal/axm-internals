import { describe, expect, it } from 'bun:test';
import { z } from 'zod';

import { ValidationError, validateResponseData } from '../../../src/index';

describe('validateResponseData', () => {
    it('returns parsed data when valid', () => {
        const schema = z.object({ ok: z.boolean() });
        const result = validateResponseData({ schema, data: { ok: true } });

        expect(result).toEqual({ ok: true });
    });

    it('throws ValidationError with response paths', () => {
        const schema = z.object({ id: z.string().uuid() });

        expect(() => validateResponseData({ schema, data: { id: 'nope' } })).toThrow(ValidationError);

        try {
            validateResponseData({ schema, data: { id: 'nope' } });
        } catch (error) {
            const validationError = error as ValidationError;
            expect(validationError.validationErrors[0]?.path).toBe('response.id');
        }
    });
});
