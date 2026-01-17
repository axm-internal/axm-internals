import { z } from 'zod';
import { ContainerSchema } from '../interfaces/ContainerInterface';

/**
 * Build a Zod schema for the command execution context.
 *
 * @param argsSchema - Schema for positional arguments.
 * @param optionsSchema - Schema for options.
 * @returns A Zod schema for the command context.
 * @remarks
 * The context includes args, options, and a container instance.
 * @example
 * ```ts
 * const contextSchema = CommandContextSchemaFactory(argsSchema, optionsSchema);
 * ```
 */
/** @internal */
export const CommandContextSchemaFactory = (
    argsSchema: z.ZodObject<z.ZodRawShape> = z.object({}),
    optionsSchema: z.ZodObject<z.ZodRawShape> = z.object({})
) =>
    z.object({
        args: argsSchema,
        options: optionsSchema,
        container: ContainerSchema,
    });

/**
 * Type for command contexts inferred from the factory schema.
 *
 * @remarks
 * Use this type when you need a validated context shape.
 * @example
 * ```ts
 * const ctx: CommandContext = { args: {}, options: {}, container };
 * ```
 */
/** @internal */
export type CommandContext = z.infer<ReturnType<typeof CommandContextSchemaFactory>>;
