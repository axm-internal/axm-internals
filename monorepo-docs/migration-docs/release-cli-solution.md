# Release CLI: Dependency Cleanup & Ultimate Solution

## Overview

This document covers two phases:
1. **Cleanup** — fix dependency issues across repo-cli, git-db, cli-kit, schema-orm, and shared utilities
2. **Ultimate solution** — design a dedicated release CLI that replaces changesets entirely

---

## Phase 1: Dependency Audit & Cleanup

### New Package: `@axm-internal/cli-tools`

Shared CLI utilities currently duplicated between repo-cli and git-db. Lives in `packages/cli-tools/` following canonical package shape.

**Contents:**
- `renderJson` — currently deep-imported from git-db internals and duplicated
- `buildCliTable` — currently duplicated across repo-cli and git-db
- `truncateString` — currently duplicated
- `formatDate` — currently internal to git-db, needed publicly

**Depended on by:** git-db, repo-cli, release-cli (future), any other CLI app.

**Why not `axm-shared`?** `axm-shared` becomes a junk drawer. `cli-tools` is scoped — CLI formatting and output utilities. `tooling-config` keeps its role as config-only (biome, remark, dup, commitlint).

### repo-cli (`apps/repo-cli`)

#### Issues Found

| Issue | Severity | Detail |
|-------|----------|--------|
| Deep import from git-db | **High** | `InteractiveOutputService` imports `renderJson` from `@axm-internal/git-db/src/utils/dataRenderer` — internal path, not public API. |
| Direct Kysely coupling | **High** | `GitQuery` writes raw `db.selectFrom('commits')` queries bypassing git-db's query layer. Implicit contract with git-db's schema. |
| Unused dependency: `ora` | Low | Listed in `package.json` but never imported. Uses `yocto-spinner` instead. |
| Duplicate utilities | Medium | `buildCliTable` and `truncateString` exist in both repo-cli and git-db. |
| tsyringe + reflect-metadata | ~~Medium~~ **Done** | Removed. Replaced with InMemoryContainer in repo-cli. NovaDI available if autowiring needed later. |

#### Cleanup Actions

1. **Move shared utilities to `@axm-internal/cli-tools`** — `renderJson`, `buildCliTable`, `truncateString`, `formatDate`
2. **Replace deep import** of `renderJson` with `@axm-internal/cli-tools` import
3. **Move raw Kysely queries into git-db** — GitQuery's direct `db.selectFrom()` calls should become proper query functions in git-db
4. **Remove `ora`** from `package.json`
5. **Remove duplicate utilities** — import from `@axm-internal/cli-tools` instead
6. **Replace tsyringe** ~~with NovaDI or InMemoryContainer~~ → **Done**. Used InMemoryContainer. (see DI section below)
7. **Remove `ChangeSetBuilder`, `ChangeSetWriter`, `changesets:create`** command after release-cli is operational

### git-db (`packages/git-db`)

#### Current State

- Purely functional API — `openBunDb()`, `scanCommits()`, `findCommitsByScope()`, etc.
- Uses Kysely for query building
- Uses execa for `git log` and `git show`
- Has its own CLI (`init`, `update`, `query`)
- `findCommitsByPackage` is path-prefix only (no scope+path JOIN)

#### Kysely vs Drizzle Assessment

git-db currently uses Kysely. Should it switch to Drizzle (via schema-orm)?

| Capability | Kysely | Drizzle (via schema-orm) | Status |
|-----------|--------|--------------------------|--------|
| JOINs | First-class, composable | Not in schema-orm Model; available via drizzle escape hatch | Need escape hatch |
| WHERE operators | Full SQL (LIKE, IN, BETWEEN, raw) | Equality only in schema-orm; full SQL via drizzle escape hatch | Need escape hatch |
| Foreign keys | Supported | Not in schema-orm DDL | Need to add |
| Composite PKs | Supported | Declared but unused in schema-orm | Need to implement |
| onConflict/upsert | Supported | Read-then-write (not atomic) | Need to fix |
| Async | Native | schema-orm is sync-only | git-db needs async |
| Composability | Excellent (chain any clause) | Limited by schema-orm Model | Escape hatch needed |
| Type safety | Full (prevents invalid JOINs) | Full on single-table; escape hatch loses some | Acceptable |

**Verdict:** Do not replace Kysely in git-db. Instead, **enhance schema-orm with the missing features** and add a drizzle escape hatch. git-db stays on Kysely for now (it works well), but when schema-orm gains the features, git-db can optionally migrate.

**The highest-ROI move for schema-orm:** expose the drizzle `db` instance and table objects via `getDrizzleDb()` and `getModelTable()`. This immediately unlocks JOINs, advanced WHERE, onConflict, and everything else drizzle supports, without reimplementing.

#### git-db Programmatic API

git-db already exports functions for programmatic use. The gap is that tag queries, topological ranges, and scope+path JOINs only exist in repo-cli's `GitQuery`. Moving those into git-db makes it a complete programmatic toolkit.

#### Issues Found

| Issue | Severity | Detail |
|-------|----------|--------|
| Missing tag/release queries | Medium | No API for listing tags, resolving tag-to-commit, or topological commit ranges. GitQuery fills this with execa. |
| `findCommitsByPackage` is naive | Medium | Just path-prefix matching. Doesn't combine scope + file path. |
| `renderJson` deep-imported | Medium | Not part of public API; used by repo-cli via internal path. |
| Duplicate CLI utilities | Medium | `buildCliTable`, `truncateString` also in repo-cli. |

#### Cleanup Actions

1. **Add tag queries** — `listTags(scope?)`, `getLatestTag(scope)`, `resolveTag(tag)` → moves execa `git tag` calls from GitQuery
2. **Add topological range queries** — `getCommitsBetweenRefs(fromRef, toRef, scope?)` → moves `git rev-list` calls
3. **Upgrade `findCommitsByPackage`** — combine scope + file-path matching (the JOIN GitQuery does manually)
4. **Move shared utilities to `@axm-internal/cli-tools`** — `renderJson`, `buildCliTable`, `truncateString`, `formatDate`
5. **Keep Kysely** for now — works well, no reason to switch until schema-orm catches up

### cli-kit (`packages/cli-kit`)

#### Current State

- Provides `CliApp`, `createCommandDefinition`, `CliOutputService`, `InMemoryContainer`
- Container-agnostic (no tsyringe dependency; ships `InMemoryContainer`)
- Commander.js under the hood
- Zod-based arg/option validation with auto-help

#### Issues Found

| Issue | Severity | Detail |
|-------|----------|--------|
| Minimal output service | Medium | Only `log`, `logSuccess`, `logError`. No warning, spinner, table, or progress. |
| No interactive prompting | Medium | No confirm, select, or text input. |
| No dry-run mechanism | Low | Only `--debug`. No `--dry-run` pattern. |

#### Cleanup Actions

1. **Add `logWarning`** to `CliOutputService` (yellow, stderr)
2. **Add dry-run support** — `dryRun` flag in `CommandContext`, propagated from `--dry-run` global option on `CliApp`
3. **Consider spinner support** — `startSpinner`/`stopSpinner` on `CliOutputService`
4. **Consider prompt primitives** — `confirm()`, `select()` as optional utilities

### schema-orm (`packages/schema-orm`)

#### Current State

- Zod-schema-driven ORM on top of drizzle-orm
- Supports bun:sqlite, better-sqlite3, expo-sqlite
- Auto-generates tables from Zod schemas
- CRUD operations via `Model` class
- **Not used** by git-db or repo-cli (they use Kysely directly)

#### Feature Gap Analysis

| Feature | Status | Effort | Implementation Path |
|---------|--------|--------|---------------------|
| JOIN support | Missing | Low (escape hatch) / High (full API) | Expose `getDrizzleDb()` + `getModelTable()` for immediate access. Full relational API later. |
| Foreign keys | Missing | Medium | Add `references` to `ColumnMetaSchema`, DDL generation, two-pass table construction in drizzle adapter |
| Composite PKs | Declared but unused | Low-Medium | `TableSpec.compositePrimaryKeys` exists but is dead code. Implement DDL + drizzle adapter. |
| Advanced WHERE | Equality only | Medium | Replace `Where<T> = Partial<T>` with operator objects (`{ like: string }`, `{ in: T[] }`, etc.) |
| onConflict/upsert | Read-then-write (not atomic) | Low | Rewrite using drizzle's `onConflictDoUpdate()`. Single atomic statement. |
| Async support | Sync only | High | Consider separate async package. Not needed for current use case. |

#### Recommended Implementation Order for schema-orm

1. **Drizzle escape hatch** (low effort, highest ROI) — `getDrizzleDb()` on the return value of `defineDatabase`, `getTable()` on `Model`. This immediately unlocks JOINs, all WHERE operators, onConflict, subqueries — everything drizzle supports.
2. **onConflict upsert** (low effort) — rewrite `Model.upsert()` to use drizzle's `.onConflictDoUpdate()`. Single atomic statement instead of 3 queries.
3. **Composite primary keys** (low-medium effort) — the `TableSpec.compositePrimaryKeys` field already exists. Implement DDL generation and drizzle adapter.
4. **Advanced WHERE operators** (medium effort) — operator objects in `Where<T>` with `buildWhere()` pattern matching.
5. **Foreign key support** (medium effort) — `references` in `ColumnMetaSchema`, DDL generation, two-pass table construction.
6. **Async support** (high effort) — separate package or generic `Model<TSchema, TMode>`.

### DI Container: tsyringe Removal (Complete)

tsyringe and reflect-metadata have been removed from the monorepo. repo-cli now uses cli-kit's `InMemoryContainer` with eager construction + `registerInstance`.

| Option | Decorators | reflect-metadata | Size | Autowiring | Status |
|--------|-----------|------------------|------|------------|--------|
| **NovaDI** (`@novadi/core`) | No | No | 3.9KB | Yes (fluent builder) | Available if needed |
| **InMemoryContainer** (cli-kit) | No | No | Already in tree | No (manual `registerInstance`/`resolve`) | **Current choice** |

If autowiring becomes necessary (e.g., release-cli with many services), migrate to NovaDI.

---

## Phase 2: Ultimate Release Solution

### Design Principles

- **Per-package by default**, batch only for initial push or shared lib updates
- **Manual trigger first**, automate later
- **Conventional commits drive semver** — no extra markdown files
- **repo-cli changelog system stays** — it already does correct per-package attribution (commit scope + changed files)
- **GitQuery capabilities move into git-db** — tag queries, topological ranges, scope+path JOINs
- **No external versioning tool** — release-cli handles bumping, tagging, and publishing natively

### Why Not bumpx?

bumpx was evaluated. It does the "lazy way" for changelogs — one root `CHANGELOG.md` from git log, no per-package attribution. The existing `repo-cli` changelog system (`.changelogs/*.json` → `changelog:update` → `changelog:write`) does the "correct way" — it matches commits to packages by scope + file paths. bumpx would replace version bumping but we'd still need our own changelog logic. Since we're building release-cli anyway, bumping is trivial to include.

### New App: `apps/release-cli`

A dedicated CLI tool for versioning, publishing, and release orchestration. Separate from repo-cli (which handles changelogs, git-db indexing, and prompt runners).

#### Architecture

```
apps/release-cli/
  src/
    index.ts
    commands/
      version.ts          # bump a package's version
      tag.ts               # create git tags for released packages
      publish.ts           # publish to npm registry
      release.ts           # full orchestration: index → changelog → version → tag → publish
    services/
      VersionService.ts   # semver bumping, package.json mutation
      TagService.ts        # git tag creation/push
      PublishService.ts    # bun publish orchestration
      ReleaseService.ts    # orchestrates the full flow
```

#### Dependencies

| Package | Usage |
|---------|-------|
| `@axm-internal/cli-kit` | CliApp, createCommandDefinition, CliOutputService |
| `@axm-internal/cli-tools` | renderJson, buildCliTable |
| `@axm-internal/git-db` | openBunDb, scanCommits, tag queries, commit range queries |
| `zod` | Command arg/option schemas |
| `execa` | git tag, git push, bun publish |

No tsyringe. Use cli-kit's `InMemoryContainer` (or NovaDI if autowiring needed).

#### Commands

**`release-cli version <package> [patch|minor|major]`**

1. Read current version from `packages/<pkg>/package.json`
2. Apply semver bump
3. If `--cascade`, bump internal deps that reference this package (patch bump)
4. Write updated `package.json` files
5. `--dry-run` to preview without writing

**`release-cli tag <package>`**

1. Read the current version from `packages/<pkg>/package.json`
2. Create annotated git tag: `@axm-internal/<pkg>@<version>`
3. `--push` to push tags to remote
4. `--dry-run` to preview

**`release-cli publish <package>`**

1. `cd packages/<pkg> && bun publish --access public`
2. `--dry-run` to preview
3. `--all` to publish all publishable packages (for initial push)
4. `--tag <dist-tag>` for prerelease channels

**`release-cli release <package> [patch|minor|major]`**

Full orchestration:
1. `git-db:index` (ensure commit index is fresh)
2. `repo-cli changelog:update <pkg>` (append new entries)
3. `repo-cli changelog:write <pkg>` (render markdown)
4. `release-cli version <pkg> <bump>` (bump version)
5. `release-cli tag <pkg>` (create tag)
6. Git commit all changes
7. `release-cli publish <pkg>` (publish to npm)
8. `--dry-run` to preview the entire flow
9. `--skip-publish` to do everything except publish

#### git-db New Functions (from Phase 1 cleanup)

```typescript
// Tag queries (currently in GitQuery via execa)
listTags(scope?: string): Promise<TagInfo[]>
getLatestTag(scope: string): Promise<TagInfo | null>
resolveTag(tagName: string): Promise<string> // returns commit hash

// Topological range queries (currently in GitQuery via execa)
getCommitsBetweenRefs(fromRef: string, toRef: string, scope?: string): Promise<Commit[]>

// Combined scope + path query (currently a manual JOIN in GitQuery)
findCommitsByScopeAndPath(scope: string, pathPrefix: string, fromHash?: string, toHash?: string): Promise<Commit[]>
```

#### repo-cli Changes (after cleanup)

- `GitQuery` becomes thinner — delegates to git-db for tag and range queries
- Remove `ChangeSetBuilder`, `ChangeSetWriter`, and `changesets:create` command
- Remove tsyringe + reflect-metadata (**Done**)
- Keep all `changelog:*` and `gitdb:*` commands
- Keep `prompt:*` commands (or move to their own tool later)

#### Release Workflow (CI)

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      package:
        description: "Package to release"
        required: true
      bump:
        description: "Version bump"
        required: true
        default: "patch"
        type: choice
        options: [patch, minor, major]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run validate
      - run: bun run release-cli release ${{ inputs.package }} ${{ inputs.bump }}
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Single workflow, single command. Manual trigger with package + bump type. Automate later by detecting conventional commit types.

---

## Execution Order

### Step 1: Create `@axm-internal/cli-tools`
1. `bun create axm-package packages/cli-tools`
2. Move `renderJson`, `buildCliTable`, `truncateString`, `formatDate` into it
3. Export from `src/index.ts`
4. Update git-db and repo-cli to import from `@axm-internal/cli-tools`

### Step 2: Clean up git-db
1. Add tag query functions
2. Add topological range query functions
3. Upgrade `findCommitsByPackage` with scope + path JOIN
4. Export `renderJson` etc. from `@axm-internal/cli-tools` (not deep paths)

### Step 3: Enhance schema-orm
1. Add drizzle escape hatch (`getDrizzleDb()`, `getTable()`)
2. Rewrite `upsert()` to use drizzle's `onConflictDoUpdate()`
3. Implement composite primary keys (already partially scaffolded)
4. Add advanced WHERE operators (operator objects)
5. Add foreign key support to DDL and schema

### Step 4: Clean up repo-cli
1. Replace deep import of `renderJson` with `@axm-internal/cli-tools`
2. Replace raw Kysely queries in GitQuery with git-db function calls
3. Remove `ora` from package.json
4. Remove duplicate utilities (use `@axm-internal/cli-tools`)
5. ~~Replace tsyringe with InMemoryContainer (or NovaDI)~~ → **Done** (InMemoryContainer)
6. Remove `ChangeSetBuilder`, `ChangeSetWriter`, `changesets:create` command

### Step 5: Clean up cli-kit
1. Add `logWarning` to CliOutputService
2. Add dry-run support to CommandContext

### Step 6: Create release-cli
1. Scaffold with `bun create axm-package` → `apps/release-cli`
2. Implement `VersionService` + `version` command
3. Implement `TagService` + `tag` command
4. Implement `PublishService` + `publish` command
5. Implement `ReleaseService` + `release` command (orchestration)

### Step 7: Remove changesets
1. Remove `@changesets/cli` from root package.json
2. Delete `.changeset/`, `.changeset-drafts/`, `.release/`
3. Remove `release-pr.yml` workflow
4. Rewrite `release.yml` to use release-cli

### Step 8: Migrate to npmjs.com
1. Follow steps in `npm-registry.md`
2. Update all publish configs to `"access": "public"`
3. Update `.npmrc` to use `NPM_TOKEN`
4. Test with a single package
5. Deprecate GitHub Packages

### Step 9: Clean up monorepo-docs
1. Follow steps in `monorepo-docs-cleanup.md`
2. Rewrite release docs
3. Update AGENTS.md and CLAUDE.md