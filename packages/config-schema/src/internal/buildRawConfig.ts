import { inferEnvName } from './inferEnvName';
import type { InternalLeafNode, InternalNode, InternalObjectNode } from './types';

/**
 * Build a raw config object from the internal schema tree.
 *
 * @param root - Root schema node.
 * @returns Raw config object with environment-derived values.
 * @remarks
 * Only leaf nodes with resolved env values are set.
 * @internal
 */
export const buildRawConfig = (root: InternalNode): Record<string, unknown> => {
    if (root.kind !== 'object') {
        throw new Error('Root node must be an object');
    }

    return buildObject(root);
};

/**
 * Recursively build an object from an internal object node.
 *
 * @param node - Object node to expand.
 * @returns Raw object subtree.
 * @remarks
 * Object children are always included, leaf children are conditional.
 * @internal
 */
const buildObject = (node: InternalObjectNode): Record<string, unknown> => {
    const out: Record<string, unknown> = {};

    for (const [key, child] of Object.entries(node.children)) {
        if (child.kind === 'object') {
            out[key] = buildObject(child);
            continue;
        }

        const resolved = resolveLeaf(child);
        if (resolved.shouldSet) {
            out[key] = resolved.value;
        }
    }

    return out;
};

/**
 * Resolve a leaf node against process.env.
 *
 * @param node - Leaf node to resolve.
 * @returns Resolution result indicating whether to set the value.
 * @remarks
 * Optional leaves are omitted when no env value is present.
 * @internal
 */
const resolveLeaf = (node: InternalLeafNode): { shouldSet: boolean; value: unknown } => {
    if (!node.env) {
        return { shouldSet: false, value: undefined };
    }

    const envName = node.env === 'auto' ? inferEnvName(node.path) : node.env;

    const raw = process.env[envName];
    if (raw === undefined) {
        return node.optional ? { shouldSet: false, value: undefined } : { shouldSet: true, value: undefined };
    }

    return { shouldSet: true, value: raw };
};
