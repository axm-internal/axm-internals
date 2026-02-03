# Releasing

This repo uses Changesets for versioning and publishing. Releases are driven by repo-cli workflows and a release PR workflow that prepares changelogs and changesets.

## One-Click Release PR (Preferred)

Use the **Release PR** workflow to prepare a release automatically.

1) In GitHub Actions, run **Release PR** (workflow_dispatch).
2) Provide a release branch name (e.g., `release/2026-01-28`).
3) The workflow will:
   - `./repo-cli gitdb:index`
   - `./repo-cli changelog:update --all`
   - `./repo-cli changelog:write --all`
   - `./repo-cli changesets:create --all`
4) If no `.changeset/*.md` files are created, no PR is opened.
5) If changesets exist, a PR is opened with only:
   - `.changelogs/**`
   - `.changeset/**`
   - `.changeset-drafts/**`
   - `CHANGELOG.md`
   - `packages/*/CHANGELOG.md`
   - `apps/*/CHANGELOG.md`

Merge the PR to `main`.

## Publishing (CI)

On merge to `main`, the existing Release workflow will run **only when changesets exist** and will:

```bash
bunx changeset version
bunx changeset publish
```

This produces the version commit (`chore(release): versioned packages`) and publishes to the registry.

## Manual Release Flow (Fallback)

If you need to run the steps locally instead of the workflow:

```bash
git checkout main
git pull
git checkout -b release/<yyyy-mm-dd>

./repo-cli gitdb:index
./repo-cli changelog:update --all
./repo-cli changelog:write --all
./repo-cli changesets:create --all

git status
git add .
git commit -m "chore(release): prepared release changesets"
```

Open a PR, merge to `main`, and CI will publish.

## Notes

- Releases are driven by the presence of `.changeset/*.md` files.
- If a package should not be released, do not add a changeset for it.
- Use `.changeset-drafts/` as the source of truth for what changed since the last tag.
- CI will skip versioning/publishing entirely when no `.changeset/*.md` files are present.
