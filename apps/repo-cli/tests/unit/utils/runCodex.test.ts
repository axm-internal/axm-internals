import { describe, expect, it, mock } from 'bun:test';
import { runCodex } from '../../../src/utils/runCodex';

const silenceStdout = () => {
    const original = process.stdout.write.bind(process.stdout);
    process.stdout.write = (() => true) as typeof process.stdout.write;
    return () => {
        process.stdout.write = original;
    };
};

const silenceStderr = () => {
    const original = process.stderr.write.bind(process.stderr);
    process.stderr.write = (() => true) as typeof process.stderr.write;
    return () => {
        process.stderr.write = original;
    };
};

const mockExeca = (stdout: string, stderr: string, exitCode: number) => {
    mock.module('execa', () => ({
        execa: () =>
            Object.assign(Promise.resolve({ stdout, stderr, exitCode }), {
                stdout: { on: (_: string, handler: (chunk: string) => void) => handler(stdout) },
                stderr: { on: (_: string, handler: (chunk: string) => void) => handler(stderr) },
            }),
    }));
};

describe('runCodex', () => {
    it('returns stdout when codex succeeds', async () => {
        mockExeca('ok', '', 0);
        const restoreOut = silenceStdout();
        const restoreErr = silenceStderr();

        try {
            const output = await runCodex('hello');
            expect(output).toBe('ok');
        } finally {
            restoreOut();
            restoreErr();
        }
    });

    it('throws when codex exits non-zero', async () => {
        mockExeca('', 'boom', 2);
        const restoreOut = silenceStdout();
        const restoreErr = silenceStderr();

        try {
            expect(runCodex('hello')).rejects.toThrow('boom');
        } finally {
            restoreOut();
            restoreErr();
        }
    });
});
