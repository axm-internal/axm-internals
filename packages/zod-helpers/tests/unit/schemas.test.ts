import { describe, expect, it } from 'bun:test';
import { AxiosInstanceSchema, PinoInstanceSchema } from '../../src';

describe('AxiosInstanceSchema', () => {
    it('accepts a minimal axios-like instance', () => {
        const mockAxios = { request: () => Promise.resolve({}) };
        expect(() => AxiosInstanceSchema.parse(mockAxios)).not.toThrow();
    });

    it('rejects invalid values', () => {
        expect(() => AxiosInstanceSchema.parse(null)).toThrow();
        expect(() => AxiosInstanceSchema.parse({})).toThrow();
    });
});

describe('PinoInstanceSchema', () => {
    it('accepts a minimal pino-like logger', () => {
        const mockLogger = {
            child: () => mockLogger,
            debug: () => undefined,
            info: () => undefined,
            warn: () => undefined,
            error: () => undefined,
        };

        expect(() => PinoInstanceSchema.parse(mockLogger)).not.toThrow();
    });

    it('rejects invalid values', () => {
        expect(() => PinoInstanceSchema.parse(null)).toThrow();
        expect(() => PinoInstanceSchema.parse({})).toThrow();
    });
});
