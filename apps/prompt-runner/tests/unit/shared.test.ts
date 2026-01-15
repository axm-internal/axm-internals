import { describe, expect, it } from 'bun:test';

import { requirePackagePath } from '../../src/shared';

const shouldThrow = (args: string[], message: string) => {
    expect(() => requirePackagePath(args)).toThrow(message);
};

describe('requirePackagePath', () => {
    it('rejects empty input', () => {
        shouldThrow([], 'Usage: <script> <package-path>');
    });

    it('rejects invalid prefix', () => {
        shouldThrow(['foo/bar'], 'Package path must start with "packages/" or "apps/".');
    });

    it('rejects missing directory', () => {
        shouldThrow(['packages/not-real'], 'Package directory not found: packages/not-real');
    });

    it('accepts existing package paths', () => {
        const result = requirePackagePath(['packages/zod-helpers']);
        expect(result.packagePath).toBe('packages/zod-helpers');
        expect(result.resolvedPath).toContain('packages/zod-helpers');
    });

    it('accepts existing app paths', () => {
        const result = requirePackagePath(['apps/prompt-runner']);
        expect(result.packagePath).toBe('apps/prompt-runner');
        expect(result.resolvedPath).toContain('apps/prompt-runner');
    });
});
