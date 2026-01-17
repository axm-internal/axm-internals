import { PinoInstanceSchema } from '@axm-internal/zod-helpers';
import { z } from 'zod';
import { ContainerSchema, InjectionTokenSchema } from '../interfaces/ContainerInterface';
import type { CommandDefinition } from './CommandDefinitionSchemaFactory';

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
export const CliOptionsSchema = z.object({
    pretty: z.boolean().default(true),
    container: ContainerSchema.optional(),
    commandDefinitions: z.array(z.custom<CommandDefinition>()).optional(),
    logger: PinoInstanceSchema.optional(),
    loggerAliases: z.array(InjectionTokenSchema).optional(),
    onError: z
        .function({
            input: z.tuple([z.instanceof(Error)]),
            output: z.void(),
        })
        .optional(),
    onExit: z
        .function({
            input: z.tuple([z.number(), z.instanceof(Error).optional()]),
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
export const CliAppParamsSchema = z.object({
    config: CliConfigSchema,
    options: CliOptionsSchema,
});

/**
 * Type for validated CLI configuration.
 *
 * @remarks
 * Derived from `CliConfigSchema`.
 * @example
 * ```ts
 * const config: CliConfig = { name: 'my-cli' };
 * ```
 */
export type CliConfig = z.infer<typeof CliConfigSchema>;
/**
 * Type for validated CLI options.
 *
 * @remarks
 * Derived from `CliOptionsSchema`.
 * @example
 * ```ts
 * const options: CliOptions = { pretty: true };
 * ```
 */
export type CliOptions = z.infer<typeof CliOptionsSchema>;
/**
 * Type for `CliApp` constructor parameters.
 *
 * @remarks
 * Derived from `CliAppParamsSchema`.
 * @example
 * ```ts
 * const params: CliAppParams = { config: { name: 'my-cli' }, options: {} };
 * ```
 */
export type CliAppParams = z.infer<typeof CliAppParamsSchema>;
