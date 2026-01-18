import { execa } from 'execa';

export const runCodex = async (prompt: string, sandboxPath?: string) => {
    const args = ['exec'];

    if (sandboxPath) {
        args.push('--add-dir', sandboxPath);
    }

    args.push(prompt);
    const proc = execa('codex', args, { reject: false });

    const toText = (chunk: Buffer | string) => (Buffer.isBuffer(chunk) ? chunk.toString() : chunk);
    proc.stdout?.on('data', (chunk: Buffer | string) => {
        process.stdout.write(`\u001b[32m${toText(chunk)}\u001b[0m`);
    });
    proc.stderr?.on('data', (chunk: Buffer | string) => {
        process.stderr.write(`\u001b[31m${toText(chunk)}\u001b[0m`);
    });

    const { exitCode, stdout, stderr } = await proc;

    if (exitCode !== 0) {
        throw new Error(stderr.trim() || `codex exec exited with code ${exitCode}`);
    }

    return stdout.trim();
};
