import { z } from 'zod';
import { CommitSchema } from './CommitSchema';
import { PackageAppSchema } from './PackageAppSchema';

export const ChangeSetBumpSchema = z.enum(['major', 'minor', 'patch']).nullable();
export type ChangeSetBump = z.infer<typeof ChangeSetBumpSchema>;

export const ChangeSetDraftSchema = z.object({
    scope: z.string(),
    packagePath: PackageAppSchema,
    latestTagName: z.string().nullable(),
    fromCommit: CommitSchema.nullable(),
    toCommit: CommitSchema.nullable(),
    commits: z.array(CommitSchema),
    suggestedBump: ChangeSetBumpSchema,
    summaryLines: z.array(z.string()),
});

export type ChangeSetDraft = z.infer<typeof ChangeSetDraftSchema>;
