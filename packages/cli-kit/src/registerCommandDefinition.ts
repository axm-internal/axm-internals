import type { Command } from 'commander';
import { z } from 'zod';
import {
    type RegisterCommandDefinitionParams,
    RegisterCommandDefinitionParamsSchema,
} from './schemas/RegisterCommandDefinitionParamsSchema';

type SchemaMeta = {
    description?: string;
    defaultValue?: unknown;
    isOptional: boolean;
    baseSchema: z.ZodTypeAny;
};

const getObjectShape = (schema: z.ZodObject<z.ZodRawShape>) => {
    const shape = (schema as unknown as { shape: z.ZodRawShape | (() => z.ZodRawShape) }).shape;
    return typeof shape === 'function' ? shape() : shape;
};

const getSchemaMeta = (schema: unknown): SchemaMeta => {
    let current = schema as z.ZodTypeAny;
    let isOptional = false;
    let defaultValue: unknown;
    let description: string | undefined =
        (current as { description?: string }).description ??
        (current as { def?: { description?: string } }).def?.description;

    const unwrapSchema = (value: z.ZodTypeAny) =>
        (value as unknown as { unwrap: () => unknown }).unwrap() as z.ZodTypeAny;

    while (current instanceof z.ZodOptional || current instanceof z.ZodNullable) {
        isOptional = true;
        current = unwrapSchema(current);
    }

    if (current instanceof z.ZodDefault) {
        isOptional = true;
        const def = (current as unknown as { def?: { defaultValue?: unknown; innerType?: z.ZodTypeAny } }).def;
        defaultValue = def?.defaultValue;
        current = def?.innerType ?? unwrapSchema(current);
    }

    if (!description) {
        description =
            (current as { description?: string }).description ??
            (current as { def?: { description?: string } }).def?.description;
    }

    return { description, defaultValue, isOptional, baseSchema: current };
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
    if (argPositions?.length) {
        return argPositions;
    }
    if (keys.length <= 1) {
        return keys;
    }
    throw new Error('argPositions is required when argsSchema has multiple keys.');
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
            const field = getObjectShape(definition.argsSchema)[key] as z.ZodTypeAny;
            if (!field) {
                throw new Error(`argPositions includes unknown key "${key}".`);
            }
            const meta = getSchemaMeta(field);
            const argName = meta.isOptional ? `[${key}]` : `<${key}>`;
            cmd.argument(argName, meta.description, meta.defaultValue);
        }
    }

    if (definition.optionsSchema) {
        for (const [key, field] of Object.entries(getObjectShape(definition.optionsSchema))) {
            const meta = getSchemaMeta(field as z.ZodTypeAny);
            const flag = `--${toKebabCase(key)}`;
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

        const argsSchema = definition.argsSchema;
        const optionsSchema = definition.optionsSchema;

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
