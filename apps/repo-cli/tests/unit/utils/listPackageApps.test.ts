import { describe, expect, it } from 'bun:test';
import { listPackageApps } from '../../../src/utils/listPackageApps';

describe('listPackageApps', () => {
    it('returns the package/app allowlist', () => {
        const list = listPackageApps();
        expect(list.length).toBeGreaterThan(0);
        expect(list.includes('packages/cli-kit')).toBe(true);
    });
});
