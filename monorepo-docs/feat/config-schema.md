# config-schema

> A schema-first configuration runtime for applications.

This library provides a **typed, self-validating configuration system** for applications. It treats configuration as *runtime infrastructure*, not just environment parsing.

It does **not** replace environment variable standards like `.env`. Instead, it builds on top of Bun’s guarantees by:

* Binding environment variables to schema paths
* Validating and coercing all values through Zod
* Producing deterministic, inspectable config trees
* Failing fast with human-readable boot errors
* Making secrets and origins first-class

The result is a predictable, debuggable config runtime suitable for services, workers, CLIs, and agent-driven tools.

---

## Goals

* Zero magic by default
* Schema as the single source of truth
* Deterministic layering
* Explicit environment binding
* Typed config slices for modules
* Clear failure modes
* First-class secret handling

This is **not** another `dotenv` wrapper.

This library answers:

* *Where did this value come from?*
* *Why did boot fail?*
* *Which config is safe to log?*
* *How do I inject only what a module needs?*

---

## Defining Configuration

Configuration is defined with a Zod-powered schema:

```ts
const config = defineConfig({
  http: {
    port: z.coerce.number().default(3000),
    host: z.string().default("0.0.0.0"),
  },

  logger: {
    path: env("LOGGER_PATH", z.string()).optional(),
  },

  db: {
    url: env("DATABASE_URL", z.string().url()).meta({ secret: true }),
    poolSize: z.number().int().min(1).default(10),
  },
});
```

Key properties:

* Every value passes through Zod
* Types are inferred automatically
* Defaults live in one place
* Env bindings are explicit
* Secrets are declared in the schema

---

## Environment Binding

Environment variables are bound via metadata:

```ts
function env<T extends z.ZodTypeAny>(name: string, schema: T): T {
  return schema.meta({ env: name });
}
```

At runtime, the loader:

1. Optionally loads `.env` files from a provided directory
2. Walks the schema tree
3. Reads `process.env[meta.env]`
4. Injects values into the raw config tree
5. Validates everything via Zod

This runtime **owns env loading**. It does not rely on Bun or Node behavior.

When `boot({ envDir })` is used, the following cascade is applied (matching Bun’s model, minus `.env.local`):

```
.env
.env.{NODE_ENV}
```

* `.env` provides the baseline
* `.env.{NODE_ENV}` overrides only the keys it defines
* `.env.local` is intentionally ignored

This produces deterministic, cross-platform behavior in Bun, Node, CI, and agent environments.

Optional convention-based inference can be enabled:

```ts
path: z.string().meta({ env: "auto" })
```

Which maps:

```
logger.path → LOGGER_PATH
```

This is opt-in. No implicit magic by default.

---

## Cross‑Runtime Support

This library is runtime-agnostic. Bun and Node are treated identically.

There is exactly **one** environment model:

* `process.env` is the source of truth
* `.env` files are loaded by this runtime when `envDir` is provided

`ConfigDefinition.boot()` accepts an optional directory:

```ts
const cfg = appConfig.boot({ envDir: "/path/to/project" });
```

When `envDir` is set, the runtime uses `dotenv` (and optionally `dotenv-expand`) to load:

```
.env
.env.{NODE_ENV}
```

In that order. Values cascade. Only the keys defined in later files override earlier ones.

If `envDir` is omitted:

```ts
const cfg = appConfig.boot();
```

Then:

* No file IO occurs
* The existing `process.env` is trusted
* Validation proceeds immediately

This keeps boot explicit and side-effect-free unless the caller opts in.

---

## Layered Sources (Future)

Layered configuration sources are planned for a future release.

The MVP focuses on a single, deterministic source of truth:

* Schema defaults
* Process environment variables

This keeps the initial implementation simple, predictable, and tightly aligned with Bun’s philosophy.

Layering (files, CLI, remote sources, etc.) will be introduced once the core runtime is stable.

---

## Typed Projections

Modules never consume the full config tree.

```ts
const httpCfg = cfg.pick("http");
const dbCfg = cfg.pick("db");
```

Each slice is:

* Typed
* Isolated
* Safe to inject

This replaces the need for a DI container in many services.

---

## Secret Awareness (Future)

The schema supports metadata such as:

```ts
z.string().meta({ secret: true })
```

However, secret-aware behaviors (redaction, masking, log-safety) are deferred until after the MVP.

The initial release treats all values uniformly and focuses on correctness and validation.

---

## Boot Behavior (MVP)

The MVP exposes a single, strict boot path:

```ts
cfg.boot();
```

* Configuration is resolved
* Environment bindings are applied
* Zod validation runs
* The process throws on failure

This keeps semantics simple and enforces a "fail fast" philosophy for HTTP services.

Alternate boot modes (`safeBoot`, `testMode`, `reload`) are intentionally deferred.

---

## Architecture & Public API

The system is intentionally split into three conceptual layers:

1. **User Schema** – what the developer writes
2. **Config Definition** – an inert blueprint returned by `defineConfig()`
3. **Runtime Config** – the validated, concrete config produced at boot

`defineConfig()` performs *no IO* and reads no environment variables. It returns a **ConfigDefinition** object that is safe to construct at import time.

```ts
const appConfig = defineConfig({
  logger: {
    path: env("LOGGER_PATH", z.string()).optional(),
  },
});
```

The returned object is a blueprint:

```ts
class ConfigDefinition<T> {
  constructor(
    public readonly schema: ZodType<T>,
    public readonly tree: InternalNode
  ) {}

  boot(): RuntimeConfig<T> {
    // walk schema
    // read env
    // build raw object
    // parse via Zod
    // throw formatted error if invalid
    // return new RuntimeConfig(parsed)
  }
}
```

Boot is explicit:

```ts
const cfg = appConfig.boot();
```

The result is a **RuntimeConfig** instance:

```ts
class RuntimeConfig<T> {
  constructor(private readonly value: T) {}

  get(): T {
    return this.value;
  }

  pick<K extends keyof T>(key: K): T[K] {
    return this.value[key];
  }
}
```

This mirrors a clean *define → compile → run → consume* lifecycle:

* Definition is pure
* Boot is effectful
* Runtime is concrete and typed

There are no global singletons and no hidden side effects.

---

## File Layout

The public surface area stays intentionally small:

```txt
src/
├─ defineConfig.ts        // exports defineConfig()
├─ ConfigDefinition.ts    // class ConfigDefinition<T>
├─ RuntimeConfig.ts       // class RuntimeConfig<T>
├─ env.ts                 // env(name, schema) helper
└─ internal/
   ├─ walkSchema.ts       // traverses Zod tree + metadata
   ├─ buildRawConfig.ts   // pulls from process.env
   ├─ formatError.ts      // human-readable errors
   └─ types.ts            // internal node representations
```

Everything under `internal/` is an implementation detail and may change.

---

## MVP Scope

Version 1 focuses on:

* Zod-first schema definition
* Explicit env binding via metadata
* Cross-runtime env loading via `boot({ envDir })`
* Deterministic `.env` cascade (`.env` → `.env.{NODE_ENV}`)
* Typed projections (`pick`)
* Clear, human-readable boot errors

Not in MVP:

* Layered config sources
* Secret-aware behaviors
* Alternate boot modes
* `.env.local` semantics

Phase 2 may include:

* Layered config sources (files, CLI, remote)
* Secret redaction and masking
* Hot reload
* Remote and distributed config
* Vault integrations

---

This library treats configuration as a **runtime contract**, not a pile of strings. It is designed for systems where correctness, clarity, and predictability matter.
