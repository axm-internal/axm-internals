import { execa } from 'execa';
import type { CommitFile } from '../db/types';
import type { ReadCommitFilesOptions } from './types';

export const readCommitFiles = async (opts: ReadCommitFilesOptions): Promise<CommitFile[]> => {
    const { hash } = opts;

    const { stdout } = await execa('git', ['show', '--name-status', '--pretty=format:', hash]);

    return stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [status, ...pathParts] = line.split('\t');
            const path = pathParts.join('\t');
            return {
                hash,
                path,
                status: status ?? '',
            } satisfies CommitFile;
        });
};
