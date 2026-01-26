# Releasing

This repo uses Changesets for versioning and publishing. Manual releases are driven by repo-cli workflows from the monorepo root.

## Manual Release Flow

1) Update the git-db index so release data is current:

```bash
./repo-cli gitdb:index
```

2) Preview draft release data for the package(s) you plan to release:

```bash
./repo-cli changesets:create packages/cli-kit --dry
./repo-cli changesets:create --all --dry
```

3) Write draft files for the package(s) you plan to release:

```bash
./repo-cli changesets:create packages/cli-kit
./repo-cli changesets:create --all
```

Drafts are written to `.changeset-drafts/` at the repo root. Use these drafts to prepare your official Changesets.

4) Create actual Changesets (the files under `.changeset/`) using the draft data:

```bash
bun changeset
```

When prompted, select the target package(s), choose the bump type, and paste a summary derived from the draft(s).

5) Commit code + `.changeset` files and open a PR:

```bash
git status
git add .
git commit -m "Prepared release changesets"
```

6) Merge to `main`. The Release workflow will run and publish the updated packages.

## Notes

- Releases are driven by the presence of `.changeset/*.md` files.
- If a package should not be released, do not add a changeset for it.
- Use `.changeset-drafts/` as the source of truth for what changed since the last tag.
