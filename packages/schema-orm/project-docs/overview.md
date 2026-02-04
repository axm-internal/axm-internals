# SchemaOrm

**SchemaOrm** is a **Zod-first SQLite ORM** built specifically for **Bun**.
It is designed for **rapid application development (RAD)**, local-first tools, and strong developer experience with minimal ceremony.

If you can define a Zod schema, you can persist it—no repositories, no adapters, no code generation.

---

## Goals

SchemaOrm exists to solve one problem well:

> **Make SQLite persistence in Bun feel instant, safe, and obvious.**

Core goals:

* **Single entry point**
  Define databases and model definitions in one call.

* **Zod as the single source of truth**
  Validation, typing, defaults, and schema definition come from Zod metadata.

* **SQLite-only (intentionally)**
  No cross‑database abstraction tax. (Multiple SQLite drivers may be supported later.)

* **Zero or near-zero configuration**
  Define a model → table exists → queries work.

* **Fast to learn, fast to ship**
  Minimal API surface, predictable behavior.

---

## Non-Goals

SchemaOrm intentionally does **not** aim to be:

* A multi-database ORM (Postgres, MySQL, etc.)
* A full DDD / Unit-of-Work framework
* A query DSL replacement for raw SQL
* A migration management platform
* An enterprise-scale abstraction layer

If you need those, this is not the right tool—and that is by design.

---

## Design Philosophy

### Zod-First

Zod schemas define:

* Table structure
* Column types
* Runtime validation
* TypeScript types
* Default values
* Optional fields

There is no separate schema language.
Since table schemas are Zod objects, validation is effectively free. Inserts and
updates validate against the table schema by default, but validation can be
skipped or replaced with a custom schema per call.
Unique constraints are enforced by SQLite; optional pre-checks can be added later.
Nullability is derived from the schema: `z.nullable(...)` or `z.optional(...)`
allows NULL; primary keys are always NOT NULL. Defaults do not change nullability.

We prefer metadata helpers over custom schema extensions so the schema remains
plain Zod. Use `.meta({ db: ... })` to capture database directives like primary
keys, autoincrement, and uniqueness.

---

### Query API First

Each model exposes a query surface starting with `findMany`. Instance lifecycles
and relationships can be added later without changing the core registry.

---

### SQLite as a Feature, Not a Limitation

SQLite is treated as:

* A fast, embedded database
* Ideal for local tools, CLIs, MCP servers, and prototypes
* Reliable and production-ready when used intentionally

SchemaOrm embraces SQLite instead of abstracting over it.

---

## Core Concepts

### Model

A model represents a table and its query surface.

* Query helpers live on the model
* Zod schema defines the contract
* Models are accessed through the database instance (e.g., `database.Users`)
* Public API (MVP):
  - Type helpers:
    - `Where<T> = Partial<T>` (equality-only for MVP)
    - `OrderBy<T> = Array<{ field: keyof T; direction: 'asc' | 'desc' }>`
    - `Pagination = { page: number; limit: number }`
  - Methods:
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
* Testing helpers (planned):
  - Provide fixtures + DB helper utilities (create/reset/seed) similar to `tests/helpers` and `tests/integration` to make user testing easy.

---

### Database

SchemaOrm uses `bun:sqlite` directly.

* Synchronous by design
* No connection pooling
* Databases are defined via `defineDatabase({ databasePath, modelDefinitions })` and expose models
  by name (e.g., `database.Users`)
* Planned: driver adapters to support other SQLite‑compatible runtimes

---

### Table Lifecycle

By default:

* Tables are auto-created on initialization
* Columns are inferred from the Zod schema
* Missing tables are not treated as errors

This behavior is optimized for RAD workflows.

Storage conventions (MVP):
- `z.date()` is stored as INTEGER (epoch milliseconds).
- `z.boolean()` is stored as INTEGER (0/1).
- `Where<T>` uses equality-only filters for now; richer operators are post‑MVP.
- DDL defaults are literal-only (e.g., `'pink'`, `42`). SQL expressions (e.g., `CURRENT_TIMESTAMP`) are not supported yet.

---

## MVP Scope

In scope:

* `defineDatabase` as the single entry point
* Zod-object schemas with metadata
* `findMany({ where, orderBy, limit } = {})` and `findPaginated({ where, orderBy, pagination } = {})`
* CRUD methods on models (`save`, `update`, `remove`, etc.)

Out of scope (for now):

* Relations and eager loading
* Model lifecycle hooks (callbacks around reads/writes)
* Multi-database support or migrations
* Composite primary keys
* Index generation
* SQL-default expressions (beyond simple literals)

---

## Intended Use Cases

SchemaOrm is ideal for:

* CLI tools
* MCP servers
* Internal dashboards
* Prototypes and hackathon projects
* Local-first applications
* Embedded databases in Bun apps

It is especially well-suited for **small-to-medium schemas** that evolve quickly.

---

## High-Level API Shape (Conceptual)

```ts
const database = defineDatabase({
  databasePath: 'sqlite://appDb.sqlite',
  modelDefinitions: {
    Users: {
      table: 'users',
      schema: z.object({
        id: makeAutoIncrement(makePrimaryKey(z.number().int())),
        name: makeUnique(z.string()),
        age: z.number().nullable(),
        favColor: z.string().default('pink'),
      }),
    },
  },
});

const adults = database.Users.findMany({
  where: { age: 21 },
  orderBy: [{ field: 'name', direction: 'asc' }],
  limit: 50,
});

const page = database.Users.findPaginated({
  pagination: { page: 1, limit: 50 },
  orderBy: [{ field: 'name', direction: 'asc' }],
});

// Pagination uses { page, limit } and returns metadata alongside items.
// {
//   pagination: { page: 1, pages: 3, limit: 5 },
//   items: users
// }
```

Exact APIs may evolve, but this illustrates the intended ergonomics.
(relations are future work, not MVP).

---

## Why SchemaOrm?

SchemaOrm exists because many existing ORMs:

* Are not designed for Bun
* Treat SQLite as an afterthought
* Separate validation from persistence
* Optimize for scale before developer experience

SchemaOrm optimizes for **speed, clarity, and local-first development**.

---

## Status

🚧 **Early development**

The API is intentionally small and opinionated.
Breaking changes may occur until the first stable release.
