import { PinoInstanceSchema } from '@axm-internal/zod-helpers';
import { z } from 'zod';
import { ContainerSchema, InjectionTokenSchema } from '../interfaces/ContainerInterface';
import { CommandDefinitionSchema } from './CommandDefinitionSchemaFactory';

/**
 * Zod schema for base CLI configuration.
 *
 * @remarks
 * Provides name, description, and version metadata.
 * @example
 * ```ts
 * CliConfigSchema.parse({ name: 'my-cli' });
 * ```
 */
/** @internal */
export const CliConfigSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    version: z.string().optional(),
});

/**
 * Zod schema for optional CLI runtime settings.
 *
 * @remarks
 * Includes container, command definitions, and logging hooks.
 * @example
 * ```ts
 * CliOptionsSchema.parse({ pretty: true });
 * ```
 */
/** @internal */
export const CliOptionsSchema = z.object({
    pretty: z.boolean().default(true),
    container: ContainerSchema.optional(),
    commandDefinitions: z.array(CommandDefinitionSchema).optional(),
    logger: PinoInstanceSchema.optional(),
    loggerAliases: z.array(InjectionTokenSchema).optional(),
    onError: z
        .function({
            input: z.tuple([z.instanceof(Error), ContainerSchema]),
            output: z.void(),
        })
        .optional(),
    onExit: z
        .function({
            input: z.tuple([z.number(), z.instanceof(Error).optional(), ContainerSchema]),
            output: z.void(),
        })
        .optional(),
});

/**
 * Zod schema for CLI app constructor parameters.
 *
 * @remarks
 * Combines config and options for `CliApp`.
 * @example
 * ```ts
 * CliAppParamsSchema.parse({ config: { name: 'my-cli' }, options: {} });
 * ```
 */
/** @internal */
export const CliAppParamsSchema = z.object({
    config: CliConfigSchema,
    options: CliOptionsSchema,
});

export type CliConfig = z.infer<typeof CliConfigSchema>;
export type CliOptions = z.infer<typeof CliOptionsSchema>;
export type CliAppParams = z.infer<typeof CliAppParamsSchema>;
