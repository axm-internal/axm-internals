import { describe, expect, it } from 'bun:test';
import { buildCliTable } from '../../../src/utils/buildCliTable';

describe('buildCliTable', () => {
    it('infers headers and rows when columns are omitted', () => {
        const table = buildCliTable({
            objs: [
                { name: 'alpha', count: 1 },
                { name: 'beta', count: 2 },
            ],
        });

        const output = table.toString();
        expect(output).toContain('name');
        expect(output).toContain('count');
        expect(output).toContain('alpha');
        expect(output).toContain('beta');
        expect(output).toContain('1');
        expect(output).toContain('2');
    });

    it('uses columns renderers for row values', () => {
        const table = buildCliTable({
            objs: [{ name: 'alpha', count: 1 }],
            columns: {
                Label: 'name',
                Count: (obj) => obj.count + 1,
                Static: 'ok',
            },
        });

        const output = table.toString();
        expect(output).toContain('Label');
        expect(output).toContain('Count');
        expect(output).toContain('Static');
        expect(output).toContain('alpha');
        expect(output).toContain('2');
        expect(output).toContain('ok');
    });
});
