import { describe, expect, it } from 'bun:test';
import { buildPrompt } from '../../../src/utils/buildPrompt';

describe('buildPrompt', () => {
    it('renders checklist template with the package name', () => {
        const prompt = buildPrompt('checklist', { packageName: 'packages/cli-kit' });
        expect(prompt).toContain('packages/cli-kit');
    });

    it('renders llms template with the package name', () => {
        const prompt = buildPrompt('llms', { packageName: 'packages/zod-helpers' });
        expect(prompt).toContain('packages/zod-helpers');
    });
});
