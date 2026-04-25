# @axm-internal/cli-tools

Shared CLI formatting and output utilities for axm-internal tools.

## Install

```bash
bun add @axm-internal/cli-tools
```

## Usage

```ts
import { buildCliTable, truncateString, renderJson } from "@axm-internal/cli-tools";

const table = buildCliTable({
    objs: [{ name: "alpha", count: 1 }],
    columns: {
        Name: "name",
        Count: (row) => row.count,
    },
});
console.log(table.toString());

console.log(truncateString("a very long string", 10));
console.log(renderJson({ key: "value" }));
```

## API

### `buildCliTable<T>(params)`

Renders an array of objects as a `cli-table3` table. Supports column renderers (string key, function, or static value).

### `truncateString(value, length?)`

Truncates a value to `length` characters (default 50) and appends `...` if truncated. Handles null/undefined/non-string values.

### `renderJson(objs)`

Pretty-prints any value as formatted JSON (`JSON.stringify` with 2-space indent).

## Notes

- Source-first, buildless package (Bun).
- Entry point: `src/index.ts`.

## Docs

Generated via `bun run docs` using TypeDoc. Output in `docs/`.