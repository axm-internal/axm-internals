import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadEnv } from '../../../src/internal/loadEnv';

const writeEnv = (dir: string, file: string, contents: string) => {
    fs.writeFileSync(path.join(dir, file), contents);
};

describe('loadEnv', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('loads .env and expands variables', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-schema-'));
        writeEnv(dir, '.env', 'HOST=localhost\nURL=http://$' + '{HOST}:3000\n');

        loadEnv(dir);

        expect(process.env.HOST).toBe('localhost');
        expect(process.env.URL).toBe('http://localhost:3000');
    });

    it('overrides with .env.{NODE_ENV} when NODE_ENV is set', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-schema-'));
        writeEnv(dir, '.env', 'PORT=3000\n');
        writeEnv(dir, '.env.test', 'PORT=4000\n');

        process.env.NODE_ENV = 'test';

        loadEnv(dir);

        expect(process.env.PORT).toBe('4000');
    });
});
