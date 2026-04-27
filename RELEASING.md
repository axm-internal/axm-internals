# Releasing

This repo uses `release-cli` for versioning, git tagging, and publishing. Releases are **manual-only** — they do not happen automatically on merge to `main`.

## Per-Package Release (Preferred)

Use `release-cli` locally to bump, tag, and publish a single package:

```bash
# Preview the release without making changes
bun run release-cli release packages/cli-kit patch --dry-run

# Actually release
bun run release-cli release packages/cli-kit minor --push

# Release with cascade bump (bump internal dependents too)
bun run release-cli release packages/cli-kit minor --cascade --push
```

The `release` command runs the full flow:
1. `repo-cli gitdb:index` — update commit index
2. `repo-cli changelog:update` — generate `.changelogs/` JSON
3. `repo-cli changelog:write` — render `CHANGELOG.md`
4. Bump version in `package.json`
5. Create annotated git tag (`@axm-internal/<scope>@<version>`)
6. Commit with `chore(release): <scope>@<version>`
7. `bun publish --access public`

Pass `--skip-publish` if you only want steps 1-6.

## Bulk Publish (CI)

To publish all packages at once via GitHub Actions:

1. Go to **Actions → Release** in the GitHub UI.
2. Click **Run workflow**.
3. Check the **Publish packages** checkbox.
4. Click **Run workflow**.

The workflow will:
- Run `./repo-cli gitdb:index`
- Run `./release-cli publish --all --push`

This publishes every publishable package and pushes all release tags.

**Releases never run automatically.** The workflow only triggers when you explicitly invoke it with `publish = true`.

## Manual Changelog Prep

If you want to prepare changelogs without releasing:

```bash
./repo-cli gitdb:index
./repo-cli changelog:update --all
./repo-cli changelog:write --all
```

This updates `.changelogs/` and `CHANGELOG.md` files across the repo.

## Notes

- Use `release-cli version` to bump versions without tagging or publishing.
- Use `release-cli tag` to create a tag for the current version.
- Use `release-cli publish` to publish a single package.
- The old changeset-based workflow has been removed.
