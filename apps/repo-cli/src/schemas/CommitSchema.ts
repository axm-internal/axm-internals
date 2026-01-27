import { z } from 'zod';

export const CommitSchema = z.object({
    hash: z.string(),
    author_id: z.string(),
    date: z.string(),
    message: z.string(),
    body: z.string(),
    refs: z.string().nullable(),
    type: z.string().nullable(),
    scope: z.string().nullable(),
    is_breaking_change: z.preprocess((value) => {
        if (value === 0) return false;
        if (value === 1) return true;
        return value;
    }, z.boolean().nullable()),
});

export type CommitSchemaInput = z.input<typeof CommitSchema>;
