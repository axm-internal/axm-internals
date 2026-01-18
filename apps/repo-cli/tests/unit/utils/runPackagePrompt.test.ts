import { describe, expect, it, mock } from 'bun:test';
import { runPackagePrompt } from '../../../src/utils/runPackagePrompt';

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

describe('runPackagePrompt', () => {
    it('builds and runs a prompt for the package path', async () => {
        let capturedArgs: string[] = [];
        mock.module('execa', () => ({
            execa: (file: string, args: string[]) => {
                capturedArgs = [file, ...args];
                return Object.assign(Promise.resolve({ stdout: 'ok', stderr: '', exitCode: 0 }), {
                    stdout: { on: (_: string, handler: (chunk: string) => void) => handler('ok') },
                    stderr: { on: (_: string, handler: (chunk: string) => void) => handler('') },
                });
            },
        }));
        const restoreOut = silenceStdout();
        const restoreErr = silenceStderr();

        try {
            const output = await runPackagePrompt('checklist', 'packages/cli-kit');
            expect(output).toBe('ok');
            expect(capturedArgs).toContain('exec');
        } finally {
            restoreOut();
            restoreErr();
        }
    });
});
