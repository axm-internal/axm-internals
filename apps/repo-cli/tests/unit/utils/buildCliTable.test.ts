import { describe, expect, it } from 'bun:test';
import { buildCliTable } from '../../../src/utils/buildCliTable';

describe('buildCliTable', () => {
    it('renders headers and rows using custom renderers', () => {
        const table = buildCliTable({
            objs: [{ name: 'alpha', count: 2 }],
            columns: {
                Name: 'name',
                Count: (row) => row.count,
            },
        });

        const output = table.toString();
        expect(output).toContain('Name');
        expect(output).toContain('Count');
        expect(output).toContain('alpha');
        expect(output).toContain('2');
    });

    it('renders empty string for missing values', () => {
        const table = buildCliTable({
            objs: [{ name: 'alpha' }],
            columns: {
                Name: 'name',
                Missing: 'missing' as 'name',
            },
        });

        const output = table.toString();
        expect(output).toContain('Name');
        expect(output).toContain('Missing');
        expect(output).toContain('alpha');
    });
});
