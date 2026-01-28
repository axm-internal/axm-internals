import type { Logger } from 'pino';

export type CreatePinoLoggerOptions = {
    baseLogger?: Logger;
    bindings?: Record<string, unknown>;
};

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
