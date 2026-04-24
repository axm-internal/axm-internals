import { describe, expect, it } from 'bun:test';
import { renderJson } from '../../src/index';

describe('renderJson', () => {
    it('renders an object as formatted JSON', () => {
        const result = renderJson({ name: 'test', count: 1 });
        expect(result).toBe(JSON.stringify({ name: 'test', count: 1 }, null, 2));
    });

    it('renders an array as formatted JSON', () => {
        const result = renderJson([1, 2, 3]);
        expect(result).toBe(JSON.stringify([1, 2, 3], null, 2));
    });

    it('renders a primitive as formatted JSON', () => {
        expect(renderJson('hello')).toBe('"hello"');
        expect(renderJson(42)).toBe('42');
        expect(renderJson(null)).toBe('null');
    });
});
