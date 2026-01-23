import { execa } from 'execa';
import type { GitCommitLog, ReadCommitOptions } from './types';

const RECORD_SEP = '\x1e';
const FIELD_SEP = '\x1f';

export const readCommits = async (opts: ReadCommitOptions = {}): Promise<GitCommitLog[]> => {
    const { sinceHash, includeMerges, limit, skip, sinceDate, untilDate } = opts;

    const args = [
        'log',
        `--pretty=format:%H${FIELD_SEP}%an${FIELD_SEP}%ae${FIELD_SEP}%ad${FIELD_SEP}%s${FIELD_SEP}%b${FIELD_SEP}%D${RECORD_SEP}`,
        '--date=iso-strict',
    ];

    if (sinceHash) {
        args.push(`${sinceHash}..HEAD`);
    }

    if (!includeMerges) {
        args.push('--no-merges');
    }

    if (typeof limit === 'number') {
        args.push(`--max-count=${limit}`);
    }

    if (typeof skip === 'number') {
        args.push(`--skip=${skip}`);
    }

    if (sinceDate) {
        args.push(`--since=${sinceDate}`);
    }

    if (untilDate) {
        args.push(`--until=${untilDate}`);
    }

    const { stdout } = await execa('git', args);

    return stdout
        .split(RECORD_SEP)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
            const [hash, authorName, authorEmail, date, message, body, refs] = line.split(FIELD_SEP);
            return {
                hash: hash ?? '',
                authorName: authorName ?? '',
                authorEmail: (authorEmail ?? '').toLowerCase(),
                date: date ?? '',
                message: message ?? '',
                body: body ?? '',
                refs: refs?.trim() || null,
            } satisfies GitCommitLog;
        });
};
