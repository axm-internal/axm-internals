import { describe, expect, it } from 'bun:test';
import { inferEnvName } from '../../../src/internal/inferEnvName';

describe('inferEnvName', () => {
    it('joins path segments with underscores', () => {
        expect(inferEnvName(['logger', 'path'])).toBe('LOGGER_PATH');
    });

    it('uppercases camelCase segments', () => {
        expect(inferEnvName(['http', 'hostPort'])).toBe('HTTP_HOST_PORT');
    });

    it('handles single-segment paths', () => {
        expect(inferEnvName(['mode'])).toBe('MODE');
    });
});
