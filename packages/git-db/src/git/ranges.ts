import { execa } from 'execa';

export const listHashesBetween = async (fromHash: string, toHash: string): Promise<string[]> => {
    const { stdout } = await execa('git', ['rev-list', '--reverse', `${fromHash}^..${toHash}`]);
    return stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
};

export const listHashesAfter = async (fromHash: string, toHash: string): Promise<string[]> => {
    const { stdout } = await execa('git', ['rev-list', '--reverse', `${fromHash}..${toHash}`]);
    return stdout
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
};
