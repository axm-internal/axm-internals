import { describe, expect, it } from 'bun:test';
import { z } from 'zod';
import { autoEnv, env } from '../../../src';
import type { InternalLeafNode, InternalNode } from '../../../src/internal/types';
import { walkSchema } from '../../../src/internal/walkSchema';

const findLeaf = (node: InternalNode, path: string[]): InternalLeafNode | undefined => {
    if (node.kind === 'leaf') {
        return node.path.join('.') === path.join('.') ? node : undefined;
    }
    const [head, ...rest] = path;
    if (!head) return;
    const child = node.children[head];
    if (!child) return;
    if (rest.length === 0) {
        return child.kind === 'leaf' ? child : undefined;
    }
    return findLeaf(child, rest);
};

describe('walkSchema', () => {
    it('throws when the root is not a Zod object', () => {
        expect(() => walkSchema(z.string())).toThrow('defineConfig() expects a Zod object at the root');
    });

    it('captures paths and env metadata for leaves', () => {
        const schema = z.object({
            logger: z.object({
                path: env('LOGGER_PATH', z.string()),
            }),
            mode: autoEnv(z.string()),
        });

        const tree = walkSchema(schema);
        expect(tree.kind).toBe('object');

        const loggerPath = findLeaf(tree, ['logger', 'path']);
        expect(loggerPath?.env).toBe('LOGGER_PATH');
        expect(loggerPath?.path).toEqual(['logger', 'path']);

        const mode = findLeaf(tree, ['mode']);
        expect(mode?.env).toBe('auto');
        expect(mode?.path).toEqual(['mode']);
    });

    it('marks optional leaves when wrapped with optional()', () => {
        const schema = z.object({
            flag: env('FLAG', z.string()).optional(),
        });

        const tree = walkSchema(schema);
        const leaf = findLeaf(tree, ['flag']);
        expect(leaf?.optional).toBeTrue();
    });

    it('does not mark defaulted leaves as optional', () => {
        const schema = z.object({
            port: env('PORT', z.string().default('3000')),
        });

        const tree = walkSchema(schema);
        const leaf = findLeaf(tree, ['port']);
        expect(leaf?.optional).toBeFalse();
    });

    it('unwraps ZodPipe and preserves base schema metadata', () => {
        const schema = z.object({
            value: env('VALUE', z.string()).transform((val) => val.trim()),
        });

        const tree = walkSchema(schema);
        const leaf = findLeaf(tree, ['value']);
        expect(leaf?.env).toBe('VALUE');
        expect(leaf?.schema).toBeInstanceOf(z.ZodString);
    });
});
