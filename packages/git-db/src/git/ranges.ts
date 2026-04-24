import { execa } from 'execa';

const parseStdoutLines = (stdout: string): string[] =>
    stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

export const listHashesBetween = async (fromHash: string, toHash: string): Promise<string[]> => {
    const { stdout } = await execa('git', ['rev-list', '--reverse', '--ancestry-path', `${fromHash}..${toHash}`]);
    const hashes = parseStdoutLines(stdout);
    const { stdout: fromStdout } = await execa('git', ['rev-parse', fromHash]);
    const fromResolved = fromStdout.trim();
    if (fromResolved && hashes.length > 0 && hashes[0] !== fromResolved) {
        hashes.unshift(fromResolved);
    }
    return hashes;
};

export const listHashesAfter = async (fromHash: string, toHash: string): Promise<string[]> => {
    const { stdout } = await execa('git', ['rev-list', '--reverse', `${fromHash}..${toHash}`]);
    return parseStdoutLines(stdout);
};
