import { describe, expect, it } from 'bun:test';
import pino from 'pino';
import { z } from 'zod';
import { CliApp } from '../../src/CliApp';
import { createCommandDefinition } from '../../src/createCommandDefinition';

describe('CliApp', () => {
    it('passes parsed args and options to the command action', async () => {
        const originalArgv = process.argv;
        process.argv = ['bun', 'script', 'hello', 'bob', '--yell'];

        let received: unknown;

        try {
            const helloCommand = createCommandDefinition({
                name: 'hello',
                description: 'says hello',
                argsSchema: z.object({
                    name: z.string().default('World'),
                }),
                optionsSchema: z.object({
                    yell: z.boolean().default(false),
                }),
                action: async (ctx) => {
                    received = ctx;
                },
            });

            const app = new CliApp({
                config: { name: 'test-cli' },
                options: { commandDefinitions: [helloCommand], pretty: false, logErrors: true },
            });

            await app.start();

            const ctx = received as { args: unknown; options: unknown; container?: unknown };
            expect(ctx.args).toEqual({ name: 'bob' });
            expect(ctx.options).toEqual({ yell: true });
            expect(ctx.container).toBeDefined();
        } finally {
            process.argv = originalArgv;
        }
    });

    it('skips default error logging when logErrors is false', async () => {
        const originalArgv = process.argv;
        process.argv = ['bun', 'script', 'boom'];

        let errorCount = 0;
        const logger = pino({ level: 'silent' });
        const originalError = logger.error.bind(logger);
        logger.error = ((...args: Parameters<typeof logger.error>) => {
            errorCount += 1;
            return originalError(...args);
        }) as typeof logger.error;

        try {
            const boomCommand = createCommandDefinition({
                name: 'boom',
                description: 'throws',
                action: async () => {
                    throw new Error('boom');
                },
            });

            const app = new CliApp({
                config: { name: 'test-cli' },
                options: {
                    commandDefinitions: [boomCommand],
                    pretty: false,
                    logger: logger,
                    logErrors: false,
                },
            });

            const exitCode = await app.start();
            expect(exitCode).toBe(1);
            expect(errorCount).toBe(0);
        } finally {
            process.argv = originalArgv;
        }
    });
});
