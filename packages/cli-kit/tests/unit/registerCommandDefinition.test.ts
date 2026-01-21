import { describe, expect, it } from 'bun:test';
import { getMetaValue } from '@axm-internal/zod-helpers';
import { Command } from 'commander';
import { type ZodType, z } from 'zod';
import { InMemoryContainer } from '../../src/containers/InMemoryContainer';
import { registerCommandDefinition } from '../../src/registerCommandDefinition';

describe('registerCommandDefinition', () => {
    it('parses args and options with schemas before calling action', async () => {
        const program = new Command();
        const container = new InMemoryContainer();
        let received: unknown;

        registerCommandDefinition({
            program,
            container,
            definition: {
                name: 'hello',
                description: 'says hello',
                argsSchema: z.object({
                    first: z.string(),
                    last: z.string(),
                }),
                argPositions: ['first', 'last'],
                optionsSchema: z.object({ debug: z.boolean().optional() }),
                action: async (ctx: unknown) => {
                    received = ctx;
                },
            },
        });

        await program.parseAsync(['hello', 'Ada', 'Lovelace', '--debug'], { from: 'user' });

        expect(received).toEqual({
            args: { first: 'Ada', last: 'Lovelace' },
            options: { debug: true },
            container,
        });
    });

    it('infers argPositions when a single arg is defined', async () => {
        const program = new Command();
        const container = new InMemoryContainer();
        let received: unknown;

        registerCommandDefinition({
            program,
            container,
            definition: {
                name: 'echo',
                description: 'echoes input',
                argsSchema: z.object({
                    message: z.string(),
                }),
                action: async (ctx: unknown) => {
                    received = ctx;
                },
            },
        });

        await program.parseAsync(['echo', 'hello'], { from: 'user' });

        expect(received).toEqual({
            args: { message: 'hello' },
            options: {},
            container,
        });
    });

    it('throws when multiple args are defined without argPositions', () => {
        const program = new Command();
        const container = new InMemoryContainer();

        expect(() =>
            registerCommandDefinition({
                program,
                container,
                definition: {
                    name: 'multi',
                    description: 'multi args',
                    argsSchema: z.object({
                        first: z.string(),
                        second: z.string(),
                    }),
                    action: async () => undefined,
                },
            })
        ).toThrow('argPositions is required when argsSchema has multiple keys.');
    });

    it('orders args by meta.position and supports option aliases', async () => {
        const program = new Command();
        const container = new InMemoryContainer();
        let received: unknown;

        const argsSchema = z.object({
            last: z.string().meta({ position: 2 }),
            first: z.string().meta({ position: 1 }),
        });
        const optionsSchema = z.object({
            verbose: z
                .boolean()
                .optional()
                .meta({ aliases: ['v'] }),
        });

        registerCommandDefinition({
            program,
            container,
            definition: {
                name: 'order',
                description: 'orders by metadata',
                argsSchema,
                optionsSchema,
                action: async (ctx: unknown) => {
                    received = ctx;
                },
            },
        });

        await program.parseAsync(['order', 'Ada', 'Lovelace', '-v'], { from: 'user' });

        expect(received).toEqual({
            args: { first: 'Ada', last: 'Lovelace' },
            options: { verbose: true },
            container,
        });
    });

    it('uses metadata descriptions and defaults for args and options', async () => {
        const program = new Command();
        const container = new InMemoryContainer();
        let received: unknown;

        const argsSchema = z.object({
            name: z.string().optional().meta({ description: 'person to greet', defaultValue: 'World' }),
        });
        const optionsSchema = z.object({
            debug: z.boolean().optional().meta({ description: 'enable debug', defaultValue: false }),
        });

        expect(getMetaValue<{ description: string }, ZodType>(argsSchema.shape.name, 'description')).toBe(
            'person to greet'
        );
        expect(getMetaValue<{ defaultValue: string }, ZodType>(argsSchema.shape.name, 'defaultValue')).toBe('World');

        registerCommandDefinition({
            program,
            container,
            definition: {
                name: 'hello',
                description: 'says hello',
                argsSchema,
                optionsSchema,
                action: async (ctx: unknown) => {
                    received = ctx;
                },
            },
        });

        const command = program.commands[0];
        expect(command?.helpInformation()).toContain('person to greet');
        expect(command?.helpInformation()).toContain('enable debug');

        await program.parseAsync(['hello'], { from: 'user' });

        expect(received).toEqual({
            args: { name: 'World' },
            options: { debug: false },
            container,
        });
    });

    it('unwraps defaults and preserves inner metadata', async () => {
        const program = new Command();
        const container = new InMemoryContainer();
        let received: unknown;

        const argsSchema = z.object({
            name: z.string().meta({ description: 'person to greet' }).default('World'),
        });
        const optionsSchema = z.object({
            count: z.number().meta({ description: 'repeat count' }).default(2),
        });

        registerCommandDefinition({
            program,
            container,
            definition: {
                name: 'repeat',
                description: 'repeats a greeting',
                argsSchema,
                optionsSchema,
                action: async (ctx: unknown) => {
                    received = ctx;
                },
            },
        });

        const command = program.commands[0];
        expect(command?.helpInformation()).toContain('person to greet');
        expect(command?.helpInformation()).toContain('repeat count');

        await program.parseAsync(['repeat'], { from: 'user' });

        expect(received).toEqual({
            args: { name: 'World' },
            options: { count: 2 },
            container,
        });
    });
});
