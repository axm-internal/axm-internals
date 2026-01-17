import type { z } from 'zod';
import type { ContainerInterface } from './interfaces/ContainerInterface';
import type { CommandDefinition } from './schemas/CommandDefinitionSchemaFactory';

/**
 * Typed command context derived from args and options schemas.
 *
 * @remarks
 * Use this type when authoring command handlers for schema-aware commands.
 * @example
 * ```ts
 * type Ctx = CommandContextForSchemas<typeof argsSchema, typeof optionsSchema>;
 * ```
 */
export type CommandContextForSchemas<
    ArgsSchema extends z.ZodObject<z.ZodRawShape>,
    OptionsSchema extends z.ZodObject<z.ZodRawShape>,
> = {
    args: z.infer<ArgsSchema>;
    options: z.infer<OptionsSchema>;
    container: ContainerInterface;
};

/**
 * Create a strongly-typed command definition.
 *
 * @param definition - Command metadata, schemas, and action handler.
 * @returns A command definition compatible with CLI registration.
 * @remarks
 * The returned object is cast to the canonical command definition shape.
 * @example
 * ```ts
 * const def = createCommandDefinition({
 *   name: 'hello',
 *   description: 'Say hello',
 *   action: async ({ options }) => {
 *     console.log(options);
 *   },
 * });
 * ```
 */
export function createCommandDefinition<
    ArgsSchema extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>,
    OptionsSchema extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>,
>(definition: {
    name: string;
    description: string;
    argsSchema?: ArgsSchema;
    optionsSchema?: OptionsSchema;
    argPositions?: string[];
    action: (ctx: CommandContextForSchemas<ArgsSchema, OptionsSchema>) => Promise<void>;
}): CommandDefinition {
    return definition as CommandDefinition;
}
