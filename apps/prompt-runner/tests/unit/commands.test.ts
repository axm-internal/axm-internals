import { describe, expect, it } from 'bun:test';

import { buildInstructions } from '../../src/commands';

describe('buildInstructions', () => {
    it('builds checklist instructions with output path', () => {
        const { instruction, outputPath } = buildInstructions('checklist', {
            packagePath: 'packages/zod-helpers',
        });

        expect(outputPath).toBe('packages/zod-helpers/checklist.md');
        expect(instruction).toContain('monorepo-docs/package-checklist.md');
        expect(instruction).toContain('bun run test');
    });

    it('builds llms instructions with output path', () => {
        const { instruction, outputPath } = buildInstructions('llms', {
            packagePath: 'packages/zod-helpers',
        });

        expect(outputPath).toBe('packages/zod-helpers/llms.txt');
        expect(instruction).toContain('packages/zod-helpers/README.md');
        expect(instruction).toContain('Version: x.y.z');
    });

    it('builds typedoc instructions without output path', () => {
        const { instruction, outputPath } = buildInstructions('typedoc', {
            packagePath: 'packages/zod-helpers',
        });

        expect(outputPath).toBeUndefined();
        expect(instruction).toContain('Typedoc/TSDoc docblocks');
        expect(instruction).toContain('@example');
    });
});
