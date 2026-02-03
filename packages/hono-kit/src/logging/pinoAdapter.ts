import type { Logger } from 'pino';

/**
 * Options for building a logger from a base Pino instance.
 *
 * @remarks
 * Bindings are added via `logger.child()` when provided.
 * @example
 * ```ts
 * const options: CreatePinoLoggerOptions = {
 *   baseLogger,
 *   bindings: { service: 'api' },
 * };
 * ```
 */
export type CreatePinoLoggerOptions = {
    baseLogger?: Logger;
    bindings?: Record<string, unknown>;
};

/**
 * Create a Pino logger with optional bindings.
 *
 * @param options - Logger base instance and bindings.
 * @returns A Pino logger (either the base logger or a child logger).
 * @remarks
 * Throws when `baseLogger` is not provided.
 * @example
 * ```ts
 * const logger = createPinoLogger({ baseLogger, bindings: { requestId } });
 * ```
 */
export const createPinoLogger = (options: CreatePinoLoggerOptions = {}): Logger => {
    const { baseLogger } = options;
    if (!baseLogger) {
        throw new Error('createPinoLogger requires a baseLogger');
    }

    const { bindings } = options;
    if (bindings && Object.keys(bindings).length > 0) {
        return baseLogger.child(bindings);
    }

    return baseLogger;
};
