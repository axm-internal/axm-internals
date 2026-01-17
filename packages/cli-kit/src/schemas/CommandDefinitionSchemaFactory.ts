import { z } from 'zod';
import { CommandActionSchemaFactory } from './CommandActionSchemaFactory';

const ZodObjectSchema = z.custom<z.ZodObject<z.ZodRawShape>>((value) => value instanceof z.ZodObject);

/**
 * Build a Zod schema for a command definition.
 *
 * @param argsSchema - Schema for positional arguments.
 * @param optionsSchema - Schema for options.
 * @returns A Zod schema describing a command definition.
 * @remarks
 * Includes action validation based on the provided schemas.
 * @example
 * ```ts
 * const defSchema = CommandDefinitionSchemaFactory(argsSchema, optionsSchema);
 * ```
 */
/** @internal */
export const CommandDefinitionSchemaFactory = (
    argsSchema: z.ZodObject<z.ZodRawShape> = z.object({}),
    optionsSchema: z.ZodObject<z.ZodRawShape> = z.object({})
) =>
    z.object({
        name: z.string(),
        description: z.string(),
        argsSchema: ZodObjectSchema.optional(),
        optionsSchema: ZodObjectSchema.optional(),
        argPositions: z.array(z.string()).optional(),
        action: CommandActionSchemaFactory(argsSchema, optionsSchema),
    });

/**
 * Type for validated command definitions.
 *
 * @remarks
 * Derived from `CommandDefinitionSchemaFactory`.
 * @example
 * ```ts
 * const definition: CommandDefinition = {
 *   name: 'hello',
 *   description: 'Say hello',
 *   action: async () => {},
 * };
 * ```
 */
/** @internal */
export type CommandDefinition = z.infer<ReturnType<typeof CommandDefinitionSchemaFactory>>;
