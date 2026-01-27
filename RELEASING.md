# Releasing

This repo uses Changesets for versioning and publishing. Manual releases are driven by repo-cli workflows from the monorepo root.

## Manual Release Flow

1) Create a release branch from `main`:

```bash
git checkout main
git pull
git checkout -b release/<yyyy-mm-dd>
```

2) Update the git-db index so release data is current:

```bash
./repo-cli gitdb:index
```

3) (Optional) Backfill or render changelogs from `.changelogs/`:

```bash
./repo-cli changelog:backfill --all --dry
./repo-cli changelog:backfill --all
./repo-cli changelog:write --all
```

4) Preview changesets for the package(s) you plan to release:

```bash
./repo-cli changesets:create packages/cli-kit --dry
./repo-cli changesets:create --all --dry
```

5) Write changeset files for the package(s) you plan to release:

```bash
./repo-cli changesets:create packages/cli-kit
./repo-cli changesets:create --all
```

Changesets are written to `.changeset/` at the repo root. Drafts (JSON) are written to
`.changeset-drafts/` for reference.

6) Commit code + `.changeset` files and open a PR:

```bash
git status
git add .
git commit -m "chore(release): prepared release changesets"
```

7) Merge the PR to `main`.

8) From `main`, version and publish:

```bash
git checkout main
git pull
bunx changeset version
git add .
git commit -m "chore(release): versioned packages"
git push
bunx changeset publish
```

## Notes

- Releases are driven by the presence of `.changeset/*.md` files.
- If a package should not be released, do not add a changeset for it.
- Use `.changeset-drafts/` as the source of truth for what changed since the last tag.
