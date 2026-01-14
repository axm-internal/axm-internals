import path from 'node:path';
import { Eta } from 'eta';
import { requirePackagePath, runCodexExec } from './shared';
import type { InstructionKind, InstructionParams } from './types';

const templateDir = path.join(import.meta.dir, 'templates');
const eta = new Eta({ views: templateDir });

const templateNames: Record<InstructionKind, string> = {
    checklist: 'checklist',
    llms: 'llms',
    typedoc: 'typedoc',
};

export function buildInstructions(
    kind: InstructionKind,
    params: InstructionParams
): { instruction: string; outputPath?: string } {
    const outputPath = kind === 'checklist' ? `${params.packagePath}/checklist.md` : undefined;
    const resolvedOutputPath = kind === 'llms' ? `${params.packagePath}/llms.txt` : outputPath;
    const instruction = eta.render(templateNames[kind], {
        packagePath: params.packagePath,
        outputPath: resolvedOutputPath,
    });

    if (!instruction) {
        throw new Error(`Failed to render template: ${templateNames[kind]}`);
    }

    return {
        instruction,
        outputPath: resolvedOutputPath,
    };
}

export async function runChecklist(args: string[]): Promise<void> {
    const { packagePath } = requirePackagePath(args);
    const { instruction, outputPath } = buildInstructions('checklist', { packagePath });
    const reply = await runCodexExec(instruction, outputPath);
    if (reply.length > 0) {
        console.log(reply);
    }
}

export async function runLlms(args: string[]): Promise<void> {
    const { packagePath } = requirePackagePath(args);
    const { instruction, outputPath } = buildInstructions('llms', { packagePath });
    const reply = await runCodexExec(instruction, outputPath);
    if (reply.length > 0) {
        console.log(reply);
    }
}

export async function runTypedoc(args: string[]): Promise<void> {
    const { packagePath } = requirePackagePath(args);
    const { instruction } = buildInstructions('typedoc', { packagePath });
    const reply = await runCodexExec(instruction);
    if (reply.length > 0) {
        console.log(reply);
    }
}
