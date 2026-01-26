import { describe, expect, it } from 'bun:test';
import { PackageAppSchema } from '../../../src/schemas/PackageAppSchema';

describe('PackageAppSchema', () => {
    it('accepts known apps', () => {
        expect(PackageAppSchema.parse('apps/repo-cli')).toBe('apps/repo-cli');
    });

    it('accepts known packages', () => {
        expect(PackageAppSchema.parse('packages/cli-kit')).toBe('packages/cli-kit');
        expect(PackageAppSchema.parse('packages/config-schema')).toBe('packages/config-schema');
        expect(PackageAppSchema.parse('packages/git-db')).toBe('packages/git-db');
    });

    it('rejects unknown names', () => {
        expect(() => PackageAppSchema.parse('packages/does-not-exist')).toThrow();
        expect(() => PackageAppSchema.parse('apps/does-not-exist')).toThrow();
    });

    it('rejects invalid prefixes', () => {
        expect(() => PackageAppSchema.parse('app/repo-cli')).toThrow();
        expect(() => PackageAppSchema.parse('packages')).toThrow();
    });
});
