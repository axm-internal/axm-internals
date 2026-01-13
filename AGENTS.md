# AGENTS.md

This file summarizes the operating rules for AI agents working in the `axm-internals` monorepo. It is derived from `monorepo-docs/*`.

## Repository Shape

- Monorepo name: `axm-internals`
- Packages live under `packages/<name>/`
- Each package is a real npm package with its own version
- Bun-first, ESM-only, buildless (source is published)
- Entry point is always `src/index.ts`
- Turborepo orchestrates repo-wide tasks (lint, test, check-types, validate)

Canonical package layout:

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

## Package Rules (Do Not Deviate)

- Package name: `@axm/<kebab-name>`
- `package.json` must follow the canonical form:

```
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

- No build step. No `dist/`. TypeScript is consumed directly by Bun.
- All packages are versioned and published via Changesets.

## Creating New Packages

Use the local Bun template:

```
bun create axm-package packages/<name>
```

This scaffolds the canonical package shape (src, tests, README, docs, llms.txt) and prompts for name/description.
Dev dependencies are installed so the post-create hook runs and removes its temporary `scripts/` folder.

## Testing

- Tests live under `tests/`, grouped by intent:
  - `tests/unit/`
  - `tests/integration/`
- Use Bun’s built-in test runner.
- A shared `@axm/test-helpers` package may exist for common utilities.

## Linting & Formatting

- **Biome** is the single source of truth for code style.
- **Remark** is used for Markdown quality.
- Remark applies to:
  - `packages/**/README.md`
  - `.changeset/*.md`
  - `monorepo-docs/**/*.md`

## Documentation Requirements (Promotion Gate)

Every package must provide:

- Typedoc-generated API documentation
- `llms.txt` at package root describing:
  - Purpose
  - Public surface
  - Intended usage
  - Non-goals
  - Stability expectations
- A package is not “promotable” until both exist.

## Versioning Semantics

- `patch`: internal refactors, no behavior change
- `minor`: new capability, backwards compatible
- `major`: consumer code must change
- Every meaningful change requires a Changeset.

## Promotion Policy

A package may be consumed by other projects only when:

- It has tests
- It has a README
- It has at least one published version
- Documentation requirements are met

## Release & Versioning Pipeline (Changesets)

Use Changesets for per-package versions, changelog generation, and publishing.

Typical flow:

1. Make changes.
2. Run `bunx changeset`.
3. Commit the changeset with code.
4. Merge to `main`.
5. CI runs tests and `changesets/action` to version and publish.

## Quality & Review Pipeline

Four-layer model:

1. **Semgrep** (pre-push): deterministic guardrails, JSON output.
2. **Sourcery** (IDE): inline suggestions, non-blocking.
3. **CodeRabbit** (PR): holistic, cross-file review.
4. **Aggregator + AI Agent**: unify feedback into a single report.

Coverage:

- Codecov with per-package flags.
- Each package produces its own coverage report.

Structural quality:

- Qlty (Code Climate) with monorepo-native, per-package metrics.

## Iteration Workflow (Local Linking)

When editing a package from a consuming project:

```
# in axm-internals/packages/<pkg>
bun link

# in consuming project
bun link @axm/<pkg>
```

Promote changes by bumping version, publishing, then unlinking in the consumer:

```
bun unlink @axm/<pkg>
bun install
```

## Guiding Philosophy

- Changes are intentional. Promotion is explicit. Nothing breaks by surprise.
- The monorepo is a platform, not a junk drawer.
