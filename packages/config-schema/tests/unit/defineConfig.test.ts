import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';
import { defineConfig, env } from '../../src';

const writeEnv = (dir: string, file: string, contents: string) => {
    fs.writeFileSync(path.join(dir, file), contents);
};

describe('defineConfig', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it('boots and returns parsed values', () => {
        const schema = z.object({
            port: env('PORT', z.coerce.number().default(3000)),
        });

        const runtime = defineConfig(schema);
        expect(runtime).toEqual({ port: 3000 });
    });

    it('formats Zod errors through formatError', () => {
        const schema = z.object({
            port: env('PORT', z.coerce.number().min(1000)),
        });

        process.env.PORT = '1';

        expect(() => defineConfig(schema)).toThrow('ConfigError: invalid configuration');
    });

    it('loads .env and .env.{NODE_ENV} when envDir is provided', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-schema-'));
        try {
            writeEnv(dir, '.env', 'PORT=3000\n');
            writeEnv(dir, '.env.test', 'PORT=4000\n');

            process.env.NODE_ENV = 'test';

            const schema = z.object({
                port: env('PORT', z.coerce.number()),
            });

            const runtime = defineConfig(schema, { envDir: dir });
            expect(runtime.port).toBe(4000);
        } finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
    });
});
