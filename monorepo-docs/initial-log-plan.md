# Changelog + Changeset Plan

This plan assumes you run commands from the monorepo root and use `./repo-cli`.

## Step 0: Update git-db Index
Goal: Ensure git-db is current before generating reports/backfills.

```bash
./repo-cli gitdb:index
```

---

## Phase 1: Changelog Backfill (JSON)
Goal: Populate `.changelogs/*.json` so initial releases are documented.

Notes:
- Root changelog entries are unscoped commits only.
- Per-package changelogs remain scope-filtered.
- Publishable packages use tags to determine backfill boundaries.
- Non-publishable apps/packages use `.changelogs/<scope>.json` metadata (last `toHash`) to track backfill position.
- Per-package changelogs include commits that match scope or touch files under the package/app path.

1) Create a branch
```bash
git checkout -b chore/changelogs-backfill
```

2) (Optional) See current backfill status
```bash
./repo-cli changelog:report --all
```

3) Preview backfill output for all packages
```bash
./repo-cli changelog:backfill --all --dry
```

4) Write backfill JSON to `.changelogs/`
```bash
./repo-cli changelog:backfill --all
```

5) Generate markdown changelogs from JSON
```bash
./repo-cli changelog:write --all
```

6) Review and commit
```bash
git status
```
Commit message (past tense):
```
chore(changelogs): backfilled initial changelog data
```

7) Merge this branch

---

## Phase 2: Changesets Creation
Goal: Generate changesets based on commits since last tags.

1) Create a new branch
```bash
git checkout -b chore/changesets-create
```

2) Preview all changesets (no files written)
```bash
./repo-cli changesets:create --all --dry
```

3) Write changesets
```bash
./repo-cli changesets:create --all
```

4) Review and commit
```bash
git status
```
Commit message (past tense):
```
chore(changesets): created release changesets
```

5) Merge this branch

---

## Notes
- `./repo-cli` runs `apps/repo-cli/src/cli.ts` directly.
- Changelog JSON lives in `.changelogs/` and is the source of truth.
- Markdown changelogs are generated from JSON via `changelog:write`.
- If you want to target a single package, replace `--all` with `packages/<name>`.
- If you only need JSON, skip `changelog:write`.
