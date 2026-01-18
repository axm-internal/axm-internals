import { getSchemaMeta } from '@axm-internal/zod-helpers';
import { ZodDefault, ZodObject, ZodOptional, type ZodType, z } from 'zod';
import type { InternalNode, InternalObjectNode, SchemaMeta } from './types';

export function walkSchema(schema: ZodType): InternalNode {
    if (!(schema instanceof ZodObject)) {
        throw new Error('defineConfig() expects a Zod object at the root');
    }

    return walkObject(schema, []);
}

function walkObject(schema: ZodObject, path: string[]): InternalObjectNode {
    const { shape } = schema;
    const children: Record<string, InternalNode> = {};

    for (const key of Object.keys(shape)) {
        const child = shape[key];
        children[key] = walkNode(child, [...path, key]);
    }

    return {
        kind: 'object',
        path,
        children,
    };
}

function walkNode(schema: ZodType, path: string[]): InternalNode {
    const { base, optional } = unwrap(schema);

    if (base instanceof ZodObject) {
        return walkObject(base, path);
    }

    const meta = getSchemaMeta<SchemaMeta>(base);

    return {
        kind: 'leaf',
        path,
        schema: base,
        env: meta?.env,
        optional,
    };
}

function unwrap(schema: ZodType): {
    base: ZodType;
    optional: boolean;
} {
    let current = schema;
    let optional = false;

    while (true) {
        if (current instanceof ZodOptional) {
            optional = true;
            current = (current as ZodOptional<ZodType>).def.innerType;
            continue;
        }

        if (current instanceof ZodDefault) {
            current = (current as ZodDefault<ZodType>).def.innerType;
            continue;
        }

        if (current instanceof z.ZodPipe) {
            const { def } = current as z.ZodPipe;
            current = def.in as unknown as ZodType;
            continue;
        }

        break;
    }

    return { base: current, optional };
}
