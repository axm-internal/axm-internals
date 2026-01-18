import type { TemplateName } from '../types';
import { buildPrompt } from './buildPrompt';
import { findRepoRoot } from './findRepoRoot';
import { requirePackagePath } from './requirePackagePath';
import { runCodex } from './runCodex';

export const runPackagePrompt = async (templateName: TemplateName, packagePath?: string): Promise<string> => {
    const { packageFullPath, packageName } = requirePackagePath(packagePath);
    const prompt = buildPrompt(templateName, { packageName });
    const sandboxPath = findRepoRoot(packageFullPath);
    return runCodex(prompt, sandboxPath);
};
