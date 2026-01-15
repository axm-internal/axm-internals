import fs from 'node:fs';
import path from 'node:path';

export type PackageGuardResult = {
    packagePath: string;
    resolvedPath: string;
};

const findRepoRoot = (startDir: string): string => {
    let current = path.resolve(startDir);
    while (true) {
        const gitDir = path.join(current, '.git');
        if (fs.existsSync(gitDir)) {
            return current;
        }
        const parent = path.dirname(current);
        if (parent === current) {
            return startDir;
        }
        current = parent;
    }
};

export function requirePackagePath(args: string[]): PackageGuardResult {
    const packagePath = args[0];
    if (!packagePath) {
        throw new Error('Usage: <script> <package-path>');
    }

    if (!packagePath.startsWith('packages/') && !packagePath.startsWith('apps/')) {
        throw new Error('Package path must start with "packages/" or "apps/".');
    }

    const repoRoot = findRepoRoot(process.cwd());
    const resolvedPath = path.resolve(repoRoot, packagePath);
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Package directory not found: ${packagePath}`);
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isDirectory()) {
        throw new Error(`Package path is not a directory: ${packagePath}`);
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
