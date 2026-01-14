import type { Logger } from 'pino';
import { z } from 'zod';

/**
 * Runtime type guard for Pino logger instances.
 *
 * @param value - Unknown value to check.
 * @returns True when the value behaves like a Pino logger.
 * @remarks
 * Checks for the standard logging methods and `child` support.
 * @example
 * ```ts
 * const logger = pino();
 * if (!isPinoLogger(logger)) {
 *   throw new Error("Not a pino logger");
 * }
 * ```
 */
const isPinoLogger = (value: unknown): value is Logger => {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Logger;

    return (
        typeof candidate.child === 'function' &&
        typeof candidate.debug === 'function' &&
        typeof candidate.info === 'function' &&
        typeof candidate.warn === 'function' &&
        typeof candidate.error === 'function'
    );
};

/**
 * Zod schema that validates Pino logger instances.
 *
 * @remarks
 * Uses a structural check to avoid tight coupling to Pino internals.
 * @example
 * ```ts
 * PinoInstanceSchema.parse(pino());
 * ```
 */
export const PinoInstanceSchema = z.custom<Logger>(isPinoLogger, {
    message: 'A valid Pino Logger instance is required.',
});
