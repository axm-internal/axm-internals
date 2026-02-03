import { describe, expect, it } from 'bun:test';
import pino from 'pino';

import { createPinoLogger } from '../../../src/index';

describe('createPinoLogger', () => {
    it('throws when baseLogger is missing', () => {
        expect(() => createPinoLogger()).toThrow('createPinoLogger requires a baseLogger');
    });

    it('returns the base logger when no bindings provided', () => {
        const baseLogger = pino({ enabled: false });
        const logger = createPinoLogger({ baseLogger });

        expect(logger).toBe(baseLogger);
    });

    it('returns a child logger when bindings are provided', () => {
        const baseLogger = pino({ enabled: false });
        const logger = createPinoLogger({ baseLogger, bindings: { service: 'hono-kit' } });

        expect(logger).not.toBe(baseLogger);
    });
});
