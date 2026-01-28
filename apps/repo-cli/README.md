# @axm-internal/repo-cli

CLI task runner for this monorepo (prompt-driven workflows and other repo automation).

## Usage

```bash
bun dev prompt:checklist packages/zod-helpers
bun dev prompt:llms packages/zod-helpers
bun dev prompt:typedoc packages/zod-helpers
bun dev gitdb:index
bun dev gitdb:package:refs packages/cli-kit
bun dev gitdb:package:commits packages/cli-kit --from <hash> --to <hash>
bun dev gitdb:releases
bun dev changesets:create packages/cli-kit
bun dev changesets:create --all --dry
bun dev changelog:backfill packages/cli-kit --dry
bun dev changelog:write --all
```

## Commands

- `prompt:checklist <package-path>` — Run the dev-complete checklist and write `checklist.md`.
- `prompt:llms <package-path>` — Generate or refresh `llms.txt`.
- `prompt:typedoc <package-path>` — Add or improve Typedoc/TSDoc docblocks.
- `gitdb:index` — Initialize or update the git-db SQLite index for the repo.
- `gitdb:package:refs <package-path>` — Show first commit and release tags for a package.
- `gitdb:package:commits <package-path> --from <hash> --to <hash>` — List commits between two hashes.
- `gitdb:releases` — List released packages and tags.
- `changesets:create <package-path>` — Create changeset drafts (writes unless `--dry`).
- `changesets:create --all --dry` — Preview drafts for all packages without writing.
- `changelog:backfill <package-path>` — Backfill `.changelogs` entries:
  - publishable: first commit → first tag
  - non-publishable: continue from the last JSON entry’s `toHash`
- Backfill includes commits that either match the scope or touch files under the package/app path.
- `changelog:backfill --all --dry` — Preview backfill report for all packages.
- `changelog:update <package-path>` — Append new `.changelogs` entries from git-db.
- `changelog:update --all --dry` — Preview update report for all packages.
- `changelog:report <package-path>` — Show backfill/report status for a package.
- `changelog:write <package-path>` — Render markdown changelogs from `.changelogs` JSON.
- `changesets:backfill <package-path>` — Report (and optionally backfill) missing initial changelogs.
- `changesets:backfill --all --dry` — Preview backfill report for all packages.

Draft output:
- Drafts are written to `.changeset-drafts/` at the repo root.

Changelog output:
- JSON lives in `.changelogs/` (`root.json` and `<scope>.json` files).
- Markdown rendering writes `CHANGELOG.md` at the repo root and inside each package/app (generated from `.changelogs/`).
- Root changelog entries include unscoped commits only.
- To generate both JSON + markdown:
  - `./repo-cli changelog:backfill --all`
  - `./repo-cli changelog:write --all`

## Docs

Generated documentation lives in `docs/` and can be updated with:

```bash
bun run docs
```
