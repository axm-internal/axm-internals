import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { ContainerSchema, InjectionTokenSchema } from '../../../src/interfaces/ContainerInterface';
import { CommandDefinitionSchema } from '../../../src/schemas/CommandDefinitionSchemaFactory';

describe('schema validation messages', () => {
    it('returns a clear error for invalid injection tokens', () => {
        const result = InjectionTokenSchema.safeParse(123);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('Injection token must be a string, symbol, or constructor.');
        }
    });

    it('returns a clear error for invalid containers', () => {
        const result = ContainerSchema.safeParse({ resolve: () => undefined });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('Container must implement resolve() and registerInstance().');
        }
    });

    it('returns a clear error for non-object schemas in command definitions', () => {
        const result = CommandDefinitionSchema.safeParse({
            name: 'bad',
            description: 'bad schema',
            argsSchema: z.string(),
            action: async () => undefined,
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe('Expected a Zod object schema.');
        }
    });
});
