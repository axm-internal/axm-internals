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

Draft output:
- Drafts are written to `.changeset-drafts/` at the repo root.

## Docs

Generated documentation lives in `docs/` and can be updated with:

```bash
bun run docs
```
