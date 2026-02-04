# @axm-internal/schema-orm

SchemaOrm is a small, sync-first ORM for Bun + SQLite built around Zod schemas.
Define a schema once and get validation, typing, and table creation automatically.

## Install

```bash
bun add @axm-internal/schema-orm zod drizzle-orm
```

## Quick Start

```ts
import { z } from 'zod';
import { defineDatabase, makeAutoIncrement, makePrimaryKey, makeUnique } from '@axm-internal/schema-orm';

const db = defineDatabase({
  databasePath: './app.sqlite',
  adapter: 'bun-sqlite',
  usePragmaPreset: true,
  pragma: {
    busy_timeout: 5000,
  },
  modelDefinitions: {
    Users: {
      table: 'users',
      schema: z.object({
        id: makeAutoIncrement(makePrimaryKey(z.number().int())),
        name: makeUnique(z.string()),
        age: z.number().nullable(),
        createdAt: z.date(),
      }),
    },
  },
});

const user = db.Users.save({ data: { name: 'Ada', age: 32, createdAt: new Date() } });
const page = db.Users.findPaginated({ pagination: { page: 1, limit: 25 } });
```

## Core API

Model methods:
- `findById({ id }) -> Item | null`
- `findOne({ where, orderBy }) -> Item | null`
- `findMany({ where, orderBy, limit } = {}) -> Item[]`
- `findPaginated({ where, orderBy, pagination } = {}) -> { pagination, items }`
- `exists({ where }) -> boolean`
- `count({ where } = {}) -> number`
- `save({ data, validate }) -> Item`
- `saveMany({ data, validate }) -> Item[]`
- `update({ where, data, validate }) -> number`
- `upsert({ where, data, validate }) -> Item`
- `remove({ where }) -> number`
- `removeMany({ where }) -> number`

Type helpers:
- `Where<T> = Partial<T>` (equality-only for MVP)
- `OrderBy<T> = Array<{ field: keyof T; direction: 'asc' | 'desc' }>`
- `Pagination = { page: number; limit: number }`

## Validation

By default, writes validate against the table schema.
You can skip validation or provide a custom schema per call:

```ts
// skip validation
await db.Users.save({ data: { name: 'Ada' }, validate: false });

// custom validation
await db.Users.save({
  data: { name: 'Ada' },
  validate: z.object({ name: z.string().min(2) }),
});
```

## Storage Conventions (MVP)

- `z.date()` is stored as INTEGER (epoch milliseconds).
- `z.boolean()` is stored as INTEGER (0/1).
- DDL defaults are literal-only (e.g., `'pink'`, `42`).
- JSON columns are stored as TEXT and round‑trip via Drizzle’s JSON mode.

## Database Path

`databasePath` accepts:
- file paths (e.g., `./app.sqlite`)
- `file://` URLs
- `sqlite://` URLs

Parent directory must already exist.

## PRAGMAs

`defineDatabase` supports:
- `usePragmaPreset: boolean` to apply the recommended preset.
- `pragma: Record<string, string | number | boolean | null>` for raw values and overrides.

Notes:
- PRAGMAs are applied at connection startup (bun:sqlite instance).
- When both are provided, the preset is applied first, then user overrides, and any `null` value removes a preset key.
- PRAGMA names are not strictly validated (adapter may warn on unknown keys).

## Hooks

`defineDatabase` accepts an optional `hooks` object:

```ts
defineDatabase({
  databasePath: './app.sqlite',
  modelDefinitions: { ... },
  hooks: {
    onConnect: ({ adapter, runner }) => {},
    onFirstCreate: ({ adapter, runner, models }) => {},
    onSchemaChange: ({ table, storedHash, currentHash }) => {},
    onModelsReady: ({ models }) => {},
  },
});
```

Notes:
- Hooks are synchronous.
- `onFirstCreate` fires only when the meta table is empty (after tables are created).
- `onSchemaChange` fires when a stored schema hash differs from the current one.
- Prefer using `runner` for raw SQL to stay adapter‑agnostic.
- Hook contexts are strongly typed from `modelDefinitions` (e.g., `models.Users` is typed).

## JSON Columns

Use `makeJson` to mark object/array schemas as JSON:

```ts
const schema = z.object({
  settings: makeJson(z.object({ theme: z.string() })),
  tags: makeJson(z.array(z.string())),
});
```

Notes:
- JSON columns are stored as TEXT and return parsed objects/arrays.
- Object/array schemas must be explicitly marked with `makeJson`.

## Adapters

SchemaOrm currently ships with sync adapters for:
- `bun-sqlite` (default)
- `better-sqlite3`
- `expo-sqlite`

Notes:
- Adapters are selected via `defineDatabase({ adapter })`.
- Each adapter owns connection setup, PRAGMA application, and the SQL runner.
- Integration tests run under Bun and only exercise `bun-sqlite`; other adapters require their native runtimes.
- Unit tests for other adapters use lightweight fakes to avoid native bindings in Bun.

### Custom Adapters (Internal)

To add a new adapter today:
- Implement the `AdapterInterface` in `src/db/adapters/AdapterInterface.ts` (prefer extending `BaseSyncSqliteAdapter` for sync drivers).
- Add the adapter id to `AdapterTypes`.
- Register it in `src/db/adapters/getAdapterInstance.ts`.

Skeleton:

```ts
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';
import { BaseSyncSqliteAdapter } from './BaseSyncSqliteAdapter';
import type { AdapterInterface } from './AdapterInterface';

export class MyAdapter extends BaseSyncSqliteAdapter<Database> implements AdapterInterface<Database> {
  readonly id = 'my-adapter';
  private readonly conn: Database;

  constructor(databasePath: string) {
    super();
    this.conn = new Database(databasePath);
  }

  protected getClient(): Database {
    return this.conn;
  }

  protected execPragma(conn: Database, statement: string): void {
    conn.run(statement);
  }

  getDrizzleDatabase() {
    return drizzle({ client: this.conn });
  }

  getSqlRunner() {
    return {
      run: (sql, params) => this.conn.run(sql, params),
      query: (sql) => this.conn.query(sql),
    };
  }
}
```

Custom adapter injection is planned post‑MVP (see Roadmap).

## Roadmap

### Planned Features
1. (open slot)

### Future Features (Post‑MVP)
- Custom Model class injection (provide your own Model implementation to `defineDatabase`).
- Adapter registration and custom adapter injection.
- Index generation in DDL.
- Composite primary keys.
- Relations and eager loading.
- Public testing helpers for fixtures and database setup.

### Future Ideas
- Additional ideas and experiments are tracked in `project-docs/ideas.md`.

## Notes

- Synchronous by design (Bun + SQLite).
- Sync-only adapters by design; async runtimes are out of scope for now.
- Tables are auto-created if missing.
- Relations and advanced operators are post-MVP.
- Integration tests run against `bun-sqlite` in Bun; adapter-specific suites will run in dedicated runtimes (e.g., Docker/Expo).

## Status

MVP in progress. See `project-docs/overview.md` for design details.

## Docs

Typedoc output lives in `docs/`. Regenerate it with:

```bash
bun run docs
```
