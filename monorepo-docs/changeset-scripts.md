# Changeset Scripts Plan

This document defines the work needed to make Changesets support manual, per-package releases with per-package and global changelogs while preserving the option to automate later. It describes the current state, the target state, and the scripts we plan to build under `apps/repo-cli`.

## What We Have Today

- Changesets is installed and configured in `.changeset/config.json`.
- Release workflow runs on every push to `main` and runs:
  - `bunx changeset version`
  - `bunx changeset publish`
- This means:
  - If changesets exist, versions/changelogs are generated and publish occurs.
  - If no changesets exist, already-published packages do not release; unpublished packages may be published.
- No per-package `CHANGELOG.md` files currently exist in the repo.
- No monorepo `CHANGELOG.md` exists.
- There is no tooling to aggregate or validate changesets from commit history.

## What We Want

- Manual releases per package (operator-controlled).
- Per-package changelogs (`packages/<name>/CHANGELOG.md`).
- A monorepo-wide `CHANGELOG.md`.
- Changelogs for all packages, including non-publishable packages.
- Ability to switch to automated releases later without re-architecting.
- Tag format stays as-is (e.g., `@axm-internal/cli-kit@0.1.0`).
- One release PR for all changelog/changeset updates (multi-package release in one PR).
- Metadata-rich JSON as the source of truth for changelog entries (used to render markdown).

## Proposed Script Set (apps/repo-cli)

These scripts are intended to be implemented in `apps/repo-cli`. Names are suggestions and can be adjusted. The core change from the previous plan is that we will use `@axm-internal/git-db` as the source of truth for commit history, file ownership, and conventional-commit parsing.

## Changeset Script Goals

- Generate initial per-package and root changelogs for packages that were auto-released without changesets.
- Generate changesets based on commits between the last tag and the most recent commit for a given scope.
- Provide deterministic, package-scoped release inputs (hashes, tags, commit lists) to keep manual release control.
- Keep the door open for future automation without changing the data model.
- Ensure changeset generation is package-scoped and never requires remembering old branches or manual diffing.
- Make missing changesets detectable and explainable by identifying commits since last tag with no changeset.
- Support manual release batching (multiple commits -> one changeset) without forcing one-PR/one-release.
- Keep changelog accuracy even if changesets were skipped historically (backfill from git history).
- Provide transparent release input data (explicit commit lists and boundaries for auditing).
- Preserve tag naming format (`@axm-internal/<name>@x.y.z`).
- Support a single release PR that aggregates changelog/changeset updates across packages.
- Generate changeset drafts using PackageInfoService data (latest tag, tag commit, latest commit, scoped commit list).
- Detect missing initial changelog data by checking for existing `CHANGELOG.md` files and first-tag coverage.
- Maintain JSON-backed changelog data so markdown can be rebuilt deterministically and de-duplicated.
- Keep changesets as markdown only; JSON is for changelog generation, not changeset storage.
- Publishable packages use git tags to determine changelog boundaries.
- Non-publishable apps/packages use `.changelogs/<scope>.json` metadata (last entry `toHash`) to know where backfill left off.
- Root changelog contains unscoped commits only (no conventional-commit scope).
- Package/app changelogs include commits that match scope or touch files under the package/app path.

## JSON Changelog Strategy (Draft)

- Store changelog entries as JSON (metadata-rich, de-dupable).
- Generate human-readable markdown changelogs from JSON (via `changelog:write`).
- Keep JSON separate from changesets; changesets remain `.md` in `.changeset/`.
- JSON storage location: `.changelogs/`.
- Use multiple JSON files:
  - `.changelogs/root.json` for the monorepo-wide changelog.
  - `.changelogs/<scope>.json` for per-package/app changelogs.
  - Root JSON is derived from unscoped commits only.

## Changelog Generation Flow

1) Index git history (required for any changelog work):

```bash
./repo-cli gitdb:index
```

2) Backfill JSON entries:

```bash
./repo-cli changelog:backfill --all
```

- Publishable packages use tags to determine the backfill range.
- Non-publishable apps/packages continue from the last JSON entry’s `toHash`.
- Scope entries include commits that match scope or touch files under the package/app path.
- Root entries include unscoped commits only.

3) Render markdown changelogs from JSON:

```bash
./repo-cli changelog:write --all
```

## Notes on DRY / Simplification

- The JSON files are the single source of truth; markdown is derived output.
- If you only need JSON, skip `changelog:write`.
- If you need both JSON + markdown, you only need two commands after indexing:
  - `changelog:backfill --all`
  - `changelog:write --all`

### 1) `gitdb:index`

Purpose:
- Initialize or update the git-db SQLite index for the repo (init if missing).

Inputs:
- None.

Output:
- Indexed commits, files, authors, and metadata stored in git-db.

Notes:
- This is the foundational step for all commit-driven scripts.

### 2) `gitdb:package:refs`

Purpose:
- Given a package, return:
  - The hash of the first commit touching that package.
  - The hashes for each release tag for that package.

Inputs:
- Package name (required).

Output:
- First commit hash.
- List of release tags and their commit hashes.

Notes:
- Package release tags follow `@axm-internal/<name>@x.y.z`.

### 3) `gitdb:package:commits`

Purpose:
- Given a package and two hashes, list all commits for that package between those hashes.

Inputs:
- Package name (required).
- `--from` hash (required).
- `--to` hash (required).

Output:
- Ordered list of commits (hash, date, subject, author).

Notes:
- The commits are filtered by files under `packages/<name>/` and/or conventional-commit scope.

### 4) `gitdb:releases`

Purpose:
- List all released packages with their tags.

Inputs:
- None.

Output:
- List of packages and tags (e.g., `@axm-internal/cli-kit@0.1.0`).

### 5) `changeset:create`

Purpose:
- Create changesets from git-db commit history.

Inputs:
- Package path (e.g., `packages/cli-kit`) or `--all` for all packages.
- Optional `--dry` to preview the changeset content without writing files.

Output:
- One changeset per target package, derived from commits between the latest tag and the latest commit for the scope.

Notes:
- Uses `PackageInfoService` to gather last tag, tag commit, latest commit, and scoped commit lists.

### 6) `changelog:backfill`

Purpose:
- Backfill JSON changelog entries from the first commit to the first tag.
- For non-publishable apps/packages, use `.changelogs/<scope>.json` to find the last recorded commit and backfill from there.

Inputs:
- Package path (e.g., `packages/cli-kit`) or `--all`.
- Optional `--dry` to preview output without writing files.

Output:
- JSON entries written to `.changelogs/<scope>.json` (and root).

Notes:
- Non-publishable entries use the ending commit timestamp as the version label.
- Scope backfill includes file-touched commits for the package/app path.

### 7) `changelog:report`

Purpose:
- Report on JSON changelog coverage and missing entries.

Inputs:
- Package path (e.g., `packages/cli-kit`) or `--all`.

Output:
- Report showing scopes that need backfill.

### 8) `changelog:write`

Purpose:
- Render markdown changelogs from `.changelogs/` JSON files.

Inputs:
- Package path (e.g., `packages/cli-kit`) or `--all`.

Output:
- `CHANGELOG.md` at the repo root and per package/app.

## Workflow Implications

Short-term (manual):
- CI should not auto-publish on every `main` merge.
- Releases occur when a maintainer runs `changeset:version:manual` and `changeset:publish:manual`.

Long-term (automated):
- Re-enable automatic release workflows using the same scripts.
- Optionally open release PRs per package as a stepping stone.

## Policy (Draft)

- `none` changesets are allowed for docs-only updates.
- Root `CHANGELOG.md` should be grouped by package.

## Open Questions

- Should `changeset:validate` be required in `bun validate`?
- Do we want to enforce "one changeset per package per release window"?
