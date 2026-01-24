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

### 1) `gitdb:index`

Purpose:
- Initialize or update the git-db SQLite index for the repo (init if missing).

Inputs:
- Optional `--full` to force a full re-index.
- Optional `--include-merges` flag.

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
