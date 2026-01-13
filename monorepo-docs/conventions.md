# Conventions

This document defines the foundational conventions for the `axm‑internals` monorepo.

These are not suggestions. They are defaults.

They exist to:

* Eliminate bikeshedding
* Preserve velocity
* Keep the platform coherent as it grows
* Make every package feel like it belongs

When in doubt, follow the conventions.

---

## 1. Package Conventions

All internal packages live under `packages/` and follow the same shape:

```
packages/<name>/
  docs/
    README.md
  llms.txt
  package.json
  README.md
  src/
    index.ts
  tests/
```

Rules:

* All packages are named `@axm/<kebab-name>`
* All packages are Bun‑first and ESM‑only
* Entry point is always `src/index.ts`
* No build step (TypeScript is consumed directly by Bun)
* Turborepo orchestrates repo-wide tasks (lint, test, check-types, validate)
* All packages are versioned and published via Changesets
* `package.json` always follows the canonical form:

```json
{
  "name": "@axm/<name>",
  "version": "0.1.0",
  "type": "module",
  "main": "src/index.ts",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

Consistency is leverage.

---

## 2. Creating New Packages

Two supported approaches:

### A) Local `bun create` template

```bash
# create inside packages/
bun create axm-package packages/logger
```

This template:

* Creates `packages/<name>/`
* Writes the canonical `package.json`
* Creates `src/index.ts`, `tests/`, `README.md`
* Adds `docs/` and `llms.txt`
* Prompts for package name + description
* Installs dev dependencies so the post-create hook can run
* Removes the nested `.git` folder created by `bun create`

Non-interactive usage:

```bash
AXM_PACKAGE_NAME=@axm/http-helper \
AXM_PACKAGE_DESC="HTTP helpers for internal services." \
bun create axm-package packages/http-helper
```

All packages are born correct.

---

## 3. Testing Strategy

Every package has a dedicated `tests/` directory:

```
packages/cli-helper/
  src/
    index.ts
  tests/
    unit/
    integration/
```

Guidelines:

* All tests use Bun’s built‑in test runner
* Tests are grouped by intent:

    * `tests/unit/` – pure logic
    * `tests/integration/` – filesystem, process, IO, etc.
* Packages may add more layers if needed (e.g. `e2e/`)

A shared `@axm/test-helpers` package may provide:

* Temp directories
* Fixture helpers
* Process runners
* Snapshot utilities

The goal is clarity and scale. Tests describe *behavior*, not just code.

---

## 4. Linting & Formatting

There is exactly one source of truth for code style.

* **Biome** is the authority for all TypeScript, JavaScript, JSON, etc.
* **Remark** is used for Markdown quality

Biome:

* One root config
* No per‑package overrides

Remark is scoped to:

* `packages/**/README.md`
* `.changeset/*.md`
* `monorepo-docs/**/*.md`

Documentation is part of the product.

---

## 5. Versioning Semantics

Changes follow semantic versioning:

* `patch` – internal refactors, no behavior change
* `minor` – new capability, backwards compatible
* `major` – consumer code must change

Every meaningful change includes a Changeset.

Releases are intentional.

---

## 6. Promotion Policy

A package may be consumed by other projects only when:

* It has tests
* It has a README
* It has at least one published version

Half‑formed utilities do not become load‑bearing.

---

## 7. Extraction Policy

When a package becomes:

* Broadly useful
* Stable
* Interesting beyond internal use

…it graduates to its own repository.

`axm‑internals` is a platform, not a junk drawer.

---

These conventions define how the platform evolves.

They exist so that future decisions are easy:

> “Does this align with the conventions?”

## 8. Documentation

Every package must provide:

- Typedoc-generated API documentation
- An `llms.txt` file describing:
    - Purpose
    - Public surface
    - Intended usage
    - Non-goals
    - Stability expectations

Rules:

- Typedoc output is generated from `src/`
- Each package exposes a `docs/` directory or participates in a central docs site
- `llms.txt` lives at the package root
- A package is not “promotable” until both exist

Documentation is part of the API.
