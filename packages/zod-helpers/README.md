# @axm/zod-helpers

A collection of Zod v4 helpers.

## Install

```bash
bun add @axm/zod-helpers
```

## Usage

```ts
import { AxiosInstanceSchema, PinoInstanceSchema } from "@axm/zod-helpers";

AxiosInstanceSchema.parse(axiosInstance);
PinoInstanceSchema.parse(logger);
```

## Notes

- Source-first, buildless package (Bun).
- Entry point: `src/index.ts`.

## Docs

Generated documentation lives in `docs/` and can be updated with:

```bash
bun run docs
```
