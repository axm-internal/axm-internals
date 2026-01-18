import path from 'node:path';
import { Eta } from 'eta';
import type { TemplateName } from '../types';

const templateDir = path.join(import.meta.dir, '../templates');
const eta = new Eta({ views: templateDir });

const templateNames: Record<TemplateName, string> = {
    checklist: 'checklist',
    llms: 'llms',
    typedoc: 'typedoc',
};

export const buildPrompt = (kind: TemplateName, params: Record<string, unknown>): string => {
    const prompt = eta.render(templateNames[kind], params);

    if (!prompt) {
        throw new Error(`Failed to render template: ${templateNames[kind]}`);
    }

    return prompt;
};
