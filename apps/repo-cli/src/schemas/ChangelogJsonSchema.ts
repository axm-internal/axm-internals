import { z } from 'zod';

export const ChangelogEntrySchema = z.object({
    version: z.string(),
    tag: z.string().nullable(),
    fromHash: z.string().nullable(),
    toHash: z.string().nullable(),
    rangeStartDate: z.string(),
    rangeEndDate: z.string(),
    summaryLines: z.array(z.string()),
    createdAt: z.string(),
});

export type ChangelogEntry = z.infer<typeof ChangelogEntrySchema>;

export const ScopedChangelogEntrySchema = ChangelogEntrySchema.extend({
    scope: z.string(),
});

export type ScopedChangelogEntry = z.infer<typeof ScopedChangelogEntrySchema>;

export const ScopeChangelogSchema = z.object({
    scope: z.string(),
    entries: z.array(ChangelogEntrySchema),
});

export type ScopeChangelog = z.infer<typeof ScopeChangelogSchema>;

export const RootChangelogSchema = z.object({
    entries: z.array(ScopedChangelogEntrySchema),
});

export type RootChangelog = z.infer<typeof RootChangelogSchema>;
