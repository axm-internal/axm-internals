import { z } from 'zod';
import { CommandContextSchemaFactory } from './CommandContextSchemaFactory';

/**
 * Build a Zod schema for a command action function.
 *
 * @param argsSchema - Schema for positional arguments.
 * @param optionsSchema - Schema for options.
 * @returns A Zod function schema for command actions.
 * @remarks
 * Produces a function schema that resolves to a promise.
 * @example
 * ```ts
 * const actionSchema = CommandActionSchemaFactory(argsSchema, optionsSchema);
 * ```
 */
/** @internal */
export const CommandActionSchemaFactory = (
    argsSchema: z.ZodObject<z.ZodRawShape> = z.object({}),
    optionsSchema: z.ZodObject<z.ZodRawShape> = z.object({})
) =>
    z.function({
        input: z.tuple([CommandContextSchemaFactory(argsSchema, optionsSchema)]),
        output: z.promise(z.void()),
    });

/**
 * Type for command action handlers inferred from the factory schema.
 *
 * @remarks
 * The handler receives a validated command context.
 * @example
 * ```ts
 * const action: CommandAction = async ({ args }) => {
 *   console.log(args);
 * };
 * ```
 */
/** @internal */
export type CommandAction = z.infer<ReturnType<typeof CommandActionSchemaFactory>>;
