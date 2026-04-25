import { execa } from 'execa';

export type TagInfo = {
    name: string;
    commitHash: string;
};

const TAG_PREFIX = '@axm-internal/';

export const listGitTags = async (pattern?: string): Promise<string[]> => {
    const args = ['tag', '--list'];
    if (pattern) {
        args.push(pattern);
    }
    const { stdout } = await execa('git', args);
    return stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
};

export const listReleaseTags = async (): Promise<string[]> => {
    return listGitTags(`${TAG_PREFIX}*@*`);
};

export const listReleaseTagsForScope = async (scope: string, sort?: 'newest-first'): Promise<string[]> => {
    const pattern = `${TAG_PREFIX}${scope}@*`;
    const args = ['tag', '--list', pattern];
    if (sort === 'newest-first') {
        args.push('--sort=-v:refname');
    }
    const { stdout } = await execa('git', args);
    return stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
};

export const resolveTag = async (tag: string): Promise<string> => {
    const { stdout } = await execa('git', ['rev-list', '-n', '1', tag]);
    return stdout.trim();
};

export const getLatestReleaseTagForScope = async (scope: string): Promise<string | null> => {
    const tags = await listReleaseTagsForScope(scope, 'newest-first');
    return tags[0] ?? null;
};

export const getHeadHash = async (): Promise<string> => {
    const { stdout } = await execa('git', ['rev-parse', 'HEAD']);
    return stdout.trim();
};

export const parseTag = (tag: string): { scope: string; version: string } | null => {
    const match = tag.match(/^@axm-internal\/([^@]+)@(.+)$/);
    if (!match) {
        return null;
    }
    return { scope: match[1] as string, version: match[2] as string };
};
