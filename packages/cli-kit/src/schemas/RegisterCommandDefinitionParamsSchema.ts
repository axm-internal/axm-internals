import { Command } from 'commander';
import { z } from 'zod';
import { ContainerSchema } from '../interfaces/ContainerInterface';
import type { CommandDefinition } from './CommandDefinitionSchemaFactory';

/**
 * Zod schema for command registration parameters.
 *
 * @remarks
 * Validates the Commander program, definition, and container.
 * @example
 * ```ts
 * RegisterCommandDefinitionParamsSchema.parse({
 *   program,
 *   definition,
 *   container,
 * });
 * ```
 */
export const RegisterCommandDefinitionParamsSchema = z.object({
    program: z.instanceof(Command),
    definition: z.custom<CommandDefinition>(),
    container: ContainerSchema,
});

/**
 * Type for validated command registration parameters.
 *
 * @remarks
 * Derived from `RegisterCommandDefinitionParamsSchema`.
 * @example
 * ```ts
 * const params: RegisterCommandDefinitionParams = { program, definition, container };
 * ```
 */
export type RegisterCommandDefinitionParams = z.infer<typeof RegisterCommandDefinitionParamsSchema>;
