import { getSchemaMeta } from '@axm-internal/zod-helpers';
import type { Command } from 'commander';
import { type ZodType, z } from 'zod';
import {
    type RegisterCommandDefinitionParams,
    RegisterCommandDefinitionParamsSchema,
} from './schemas/RegisterCommandDefinitionParamsSchema';

type SchemaDetails = {
    description?: string;
    defaultValue?: unknown;
    isOptional: boolean;
    baseSchema: ZodType;
    position?: number;
    aliases?: string[];
};

const getObjectShape = (schema: z.ZodObject<z.ZodRawShape>) => {
    return schema.shape;
};

type SchemaMeta = {
    description?: string;
    defaultValue?: unknown;
    position?: number;
    aliases?: string[];
};

const getSchemaDetails = (schema: ZodType): SchemaDetails => {
    let current = schema;
    let isOptional = false;
    let meta = getSchemaMeta<SchemaMeta>(current);

    const mergeMeta = (base: SchemaMeta, next: SchemaMeta): SchemaMeta => ({
        description: base.description ?? next.description,
        defaultValue: base.defaultValue ?? next.defaultValue,
        position: base.position ?? next.position,
        aliases: base.aliases ?? next.aliases,
    });

    const unwrapSchema = (value: ZodType) => {
        if (value instanceof z.ZodOptional || value instanceof z.ZodNullable || value instanceof z.ZodDefault) {
            return value.unwrap() as ZodType;
        }
        if (value instanceof z.ZodPipe) {
            return value.in as ZodType;
        }
        return value;
    };

    while (true) {
        if (current instanceof z.ZodOptional || current instanceof z.ZodNullable) {
            isOptional = true;
        }
        if (current instanceof z.ZodDefault) {
            isOptional = true;
        }

        const next = unwrapSchema(current);
        if (next === current) {
            break;
        }
        current = next;
        meta = mergeMeta(meta, getSchemaMeta<SchemaMeta>(current));
    }

    return {
        description: meta.description,
        defaultValue: meta.defaultValue,
        isOptional,
        baseSchema: current,
        position: meta.position,
        aliases: meta.aliases,
    };
};

const toKebabCase = (value: string) =>
    value
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();

const buildArgsObject = (positions: string[], values: unknown[]) => {
    const result: Record<string, unknown> = {};
    for (const [index, key] of positions.entries()) {
        result[key] = values[index];
    }
    return result;
};

const getArgPositions = (schema: z.ZodObject<z.ZodRawShape>, argPositions?: string[]) => {
    const keys = Object.keys(getObjectShape(schema));
    const metaPositions = keys
        .map((key) => {
            const field = getObjectShape(schema)[key] as ZodType;
            const details = getSchemaDetails(field);
            return details.position === undefined ? undefined : { key, position: details.position };
        })
        .filter((value): value is { key: string; position: number } => value !== undefined);

    if (argPositions?.length) {
        return argPositions;
    }
    if (metaPositions.length > 0) {
        if (metaPositions.length !== keys.length) {
            throw new Error('All args must define meta.position when using metadata ordering.');
        }
        const uniquePositions = new Set(metaPositions.map((entry) => entry.position));
        if (uniquePositions.size !== metaPositions.length) {
            throw new Error('Arg meta.position values must be unique.');
        }
        return metaPositions.sort((a, b) => a.position - b.position).map((entry) => entry.key);
    }
    if (keys.length <= 1) {
        return keys;
    }
    throw new Error('argPositions is required when argsSchema has multiple keys.');
};

const normalizeAlias = (alias: string) => {
    if (alias.startsWith('-')) {
        return alias;
    }
    if (alias.length === 1) {
        return `-${alias}`;
    }
    return `--${alias}`;
};

const buildOptionFlag = (key: string, aliases?: string[]) => {
    const baseFlag = `--${toKebabCase(key)}`;
    if (!aliases || aliases.length === 0) {
        return baseFlag;
    }
    const flags = new Set([baseFlag, ...aliases.map(normalizeAlias)]);
    return Array.from(flags).join(', ');
};

/**
 * Register a command definition with a Commander program.
 *
 * @param options - Registration parameters including program, definition, and container.
 * @returns Nothing.
 * @remarks
 * Builds arguments and options from Zod schemas and wires the action handler.
 * @example
 * ```ts
 * registerCommandDefinition({ program, definition, container });
 * ```
 */
export const registerCommandDefinition = (options: RegisterCommandDefinitionParams) => {
    const { program, definition, container } = RegisterCommandDefinitionParamsSchema.parse(options);

    const cmd = program.command(definition.name).description(definition.description);
    cmd.allowExcessArguments(true);

    if (definition.argsSchema) {
        const positions = getArgPositions(definition.argsSchema, definition.argPositions);
        for (const key of positions) {
            const field = getObjectShape(definition.argsSchema)[key] as ZodType;
            if (!field) {
                throw new Error(`argPositions includes unknown key "${key}".`);
            }
            const meta = getSchemaDetails(field);
            const argName = meta.isOptional ? `[${key}]` : `<${key}>`;
            cmd.argument(argName, meta.description, meta.defaultValue);
        }
    }

    if (definition.optionsSchema) {
        for (const [key, field] of Object.entries(getObjectShape(definition.optionsSchema))) {
            const meta = getSchemaDetails(field as ZodType);
            const flag = buildOptionFlag(key, meta.aliases);
            const isBoolean = meta.baseSchema instanceof z.ZodBoolean;
            const isNumber = meta.baseSchema instanceof z.ZodNumber;
            const isString = meta.baseSchema instanceof z.ZodString || meta.baseSchema instanceof z.ZodEnum;
            const description = meta.description ?? `Set ${key}`;

            if (isBoolean) {
                if (typeof meta.defaultValue === 'boolean') {
                    cmd.option(flag, description, meta.defaultValue);
                } else {
                    cmd.option(flag, description);
                }
                continue;
            }

            if (isNumber) {
                const numberDefault = typeof meta.defaultValue === 'number' ? meta.defaultValue : undefined;
                const valueFlag = `${flag} <number>`;
                if (!meta.isOptional && numberDefault === undefined) {
                    cmd.requiredOption(valueFlag, description, parseFloat);
                } else {
                    cmd.option(valueFlag, description, parseFloat, numberDefault);
                }
                continue;
            }

            if (isString) {
                const stringDefault = typeof meta.defaultValue === 'string' ? meta.defaultValue : undefined;
                const valueFlag = `${flag} <string>`;
                if (!meta.isOptional && stringDefault === undefined) {
                    cmd.requiredOption(valueFlag, description);
                } else if (stringDefault !== undefined) {
                    cmd.option(valueFlag, description, stringDefault);
                } else {
                    cmd.option(valueFlag, description);
                }
                continue;
            }

            const valueFlag = `${flag} <value>`;
            cmd.option(valueFlag, `${description} (complex type)`);
        }
    }

    cmd.action((...args: unknown[]) => {
        const command = args.at(-1) as Command | undefined;
        const stringArgs = args.filter((arg): arg is string => typeof arg === 'string');
        const commandArgs = stringArgs.length > 0 ? stringArgs : (command?.args ?? args.slice(0, -2));
        const options = command?.opts?.() ?? (args.at(-2) as Record<string, unknown>);

        const { argsSchema, optionsSchema } = definition;

        const argPositions = argsSchema ? getArgPositions(argsSchema, definition.argPositions) : [];
        const argsObject = argPositions.length > 0 ? buildArgsObject(argPositions, commandArgs) : {};

        const parsedArgs =
            argsSchema && Object.keys(getObjectShape(argsSchema)).length > 0
                ? argsSchema.parse(argsObject)
                : argsObject;
        const parsedOptions =
            optionsSchema && Object.keys(getObjectShape(optionsSchema)).length > 0
                ? optionsSchema.parse(options)
                : (options as Record<string, unknown>);

        return definition.action({
            args: parsedArgs,
            options: parsedOptions,
            container,
        });
    });
};
