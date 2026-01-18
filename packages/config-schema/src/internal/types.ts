import type { ZodType } from 'zod';

export type InternalNode = InternalObjectNode | InternalLeafNode;

export interface InternalBaseNode {
    /** Full path from root, e.g. ["logger", "path"] */
    path: string[];
}

export interface InternalObjectNode extends InternalBaseNode {
    kind: 'object';
    children: Record<string, InternalNode>;
}

export interface InternalLeafNode extends InternalBaseNode {
    kind: 'leaf';

    /** The Zod schema for this value */
    schema: ZodType;

    /** Explicit env binding or "auto" */
    env?: string | 'auto';

    /** Whether the value is optional */
    optional: boolean;
}

export type SchemaMeta = { env?: string | 'auto' };
