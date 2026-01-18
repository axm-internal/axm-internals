# @axm-internal/config-schema

A schema-first configuration runtime for applications.

## Install

```bash
bun add @axm-internal/config-schema
```

## Features

- Typed, self-validating configuration via Zod.
- Explicit environment bindings with `env()` and opt-in inference with `autoEnv()`.
- Deterministic env loading: `.env` then `.env.{NODE_ENV}` when `envDir` is provided.
- Human-readable boot errors with path and env context.
- Typed projections with `pick()` for module-level config slices.

## Usage

```ts
import { defineConfig, env, autoEnv } from '@axm-internal/config-schema';
import { z } from 'zod';

const config = defineConfig({
    http: {
        port: z.coerce.number().default(3000),
        host: z.string().default('0.0.0.0'),
    },
    logger: {
        path: autoEnv(z.string()).optional(),
    },
    db: {
        url: env('DATABASE_URL', z.string().url()),
        poolSize: z.number().int().min(1).default(10),
    },
});

const runtime = config.boot({ envDir: process.cwd() });
const httpCfg = runtime.pick('http');
```

## Future Features

- Layered sources beyond env/defaults (files, CLI, remote sources).
- First-class secret handling and redaction metadata.
- Generate `sample.env` from the expected env vars in a config.

## Notes

- Source-first, buildless package (Bun).
- Entry point: `src/index.ts`.
