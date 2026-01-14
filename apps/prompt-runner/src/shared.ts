import fs from 'node:fs';
import path from 'node:path';

export type PackageGuardResult = {
    packagePath: string;
    resolvedPath: string;
};

export function requirePackagePath(args: string[]): PackageGuardResult {
    const packagePath = args[0];
    if (!packagePath) {
        console.error('Usage: <script> <package-path>');
        process.exit(1);
    }

    if (!packagePath.startsWith('packages/')) {
        console.error('Package path must start with "packages/".');
        process.exit(1);
    }

    const resolvedPath = path.resolve(process.cwd(), packagePath);
    if (!fs.existsSync(resolvedPath)) {
        console.error(`Package directory not found: ${packagePath}`);
        process.exit(1);
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
        console.error(`Package path is not a directory: ${packagePath}`);
        process.exit(1);
    }

    return { packagePath, resolvedPath };
}

export async function runCodexExec(instruction: string, outputPath?: string): Promise<string> {
    const args = ['codex', 'exec'];
    if (outputPath) {
        args.push('--output-last-message', outputPath);
    }
    args.push(instruction);

    const proc = Bun.spawn(args, {
        stdout: 'pipe',
        stderr: 'pipe',
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    if (exitCode !== 0) {
        throw new Error(stderr.trim() || `codex exec exited with code ${exitCode}`);
    }

    return stdout.trim();
}
