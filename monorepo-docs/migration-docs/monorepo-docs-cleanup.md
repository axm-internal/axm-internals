# monorepo-docs Cleanup

## Goal

Consolidate and clean up `monorepo-docs/` so it serves as a clear, non-redundant reference.

## Current Structure

```
monorepo-docs/
  archived/
    back-log.md
    changeset-scripts.md       ← stale (changeset removal pending)
    config-schema.md            ← stale (package exists, docs live in package)
    git-db-plan.md              ← stale (package exists, docs live in package)
    hono-kit-plan.md            ← stale (package exists, docs live in package)
    hono-server-wrapper.md      ← stale (superseded by hono-kit)
    intro-to-changesets.md      ← stale (changeset removal pending)
    overview.md                 ← outdated (AGENTS.md replaces this)
  feat/
    BunQueue-package.md          ← active (pre-implementation spec)
    cli-runner.md                ← verify: still relevant?
    code-quality-review-pipeline.md
  prompts/
    llms-txt-generator.md
    typedoc-docblocks.md
  conventions.md                 ← canonical
  package-checklist.md           ← canonical
  release-versioning-pipeline.md ← rewrite after changesets removal
```

## Problems

1. **`archived/` is a graveyard** — 7 files, most are stale. Two will be moot after changesets removal.
2. **`release-versioning-pipeline.md`** is entirely about changesets — must be rewritten.
3. **`feat/` has no clear criteria** — when does a spec become a package? Should it move after implementation?
4. **`overview.md` in archived** overlaps heavily with `AGENTS.md`.
5. **`conventions.md`** overlaps with `AGENTS.md` and `CLAUDE.md`.

## Proposed Structure

```
monorepo-docs/
  conventions.md              ← keep (authoritative)
  package-checklist.md         ← keep (authoritative)
  release-pipeline.md          ← rename + rewrite (no changesets)
  feat/
    BunQueue-package.md         ← keep (active spec)
    cli-runner.md               ← keep or archive after review
    code-quality-review-pipeline.md  ← keep
  prompts/
    llms-txt-generator.md       ← keep
    typedoc-docblocks.md        ← keep
  migration-docs/
    npm-registry.md             ← keep (new)
    remove-changesets.md         ← keep (new)
    monorepo-docs-cleanup.md    ← this file, delete after execution
```

## Actions

### Delete

| File | Reason |
|------|--------|
| `archived/changeset-scripts.md` | Moot after changesets removal |
| `archived/intro-to-changesets.md` | Moot after changesets removal |
| `archived/overview.md` | Replaced by AGENTS.md |
| `archived/config-schema.md` | Package has its own docs |
| `archived/git-db-plan.md` | Package has its own docs |
| `archived/hono-kit-plan.md` | Package has its own docs |
| `archived/hono-server-wrapper.md` | Superseded by hono-kit |
| `archived/back-log.md` | Stale backlog, no value |
| `release-versioning-pipeline.md` | Replaced by `release-pipeline.md` |

### Rename + Rewrite

| From | To | Change |
|------|----|--------|
| `release-versioning-pipeline.md` | `release-pipeline.md` | Rewrite without changesets |

### Review

| File | Question |
|------|----------|
| `feat/cli-runner.md` | Is this still an active spec or has it been implemented? |

### Keep As-Is

- `conventions.md` — canonical reference
- `package-checklist.md` — canonical reference
- `feat/BunQueue-package.md` — active spec
- `feat/code-quality-review-pipeline.md` — active reference
- `prompts/*` — active Codex skills
- `migration-docs/npm-registry.md` — new
- `migration-docs/remove-changesets.md` — new

## Execution Order

1. Delete `archived/` contents (or the whole directory)
2. Rewrite `release-versioning-pipeline.md` → `release-pipeline.md`
3. Update `AGENTS.md` and `CLAUDE.md` to reference `release-pipeline.md` instead of `release-versioning-pipeline.md`
4. Review `feat/cli-runner.md` — archive if implemented
5. Delete this file (`monorepo-docs-cleanup.md`) after cleanup is done