# axm-internals – Release & Versioning Pipeline

This document defines how internal packages in `axm-internals` are versioned and released.

The goals are:

* Per-package versioning in a monorepo
* Zero surprise breakage for consuming projects
* Clear, intentional upgrades
* JSON-backed changelogs rendered by repo-cli
* Manual releases — nothing publishes automatically

The chosen tool for this is **release-cli** (apps/release-cli).

---

## Why release-cli

release-cli replaces the old Changesets-based workflow. It provides:

* Package-level versioning via explicit commands
* Semver bumping (patch, minor, major) with optional cascade to dependents
* Annotated git tags (`@axm-internal/<scope>@<version>`)
* Integration with repo-cli for changelog generation
* Manual CI publishing — nothing happens automatically

It fits the axm-internals philosophy:

> Changes are intentional. Promotion is explicit. Nothing breaks by surprise.

---

## Mental Model

Every meaningful change to a package is released with an explicit command:

```bash
bun run release-cli release <package-path> <bump>
```

This runs the full release flow:

1. `./repo-cli gitdb:index` — update the commit SQLite index
2. `./repo-cli changelog:update <package>` — append new `.changelogs/` JSON entries
3. `./repo-cli changelog:write <package>` — render `CHANGELOG.md`
4. Bump the package version in `package.json`
5. Commit with `chore(release): <scope>@<version>`
6. Create an annotated git tag (`@axm-internal/<scope>@<version>`)
7. `bun publish --access public`

Use `--dry-run` to preview without executing. Use `--skip-publish` to stop after step 6.

---

## Commands

### Release a single package

```bash
bun run release-cli release packages/cli-kit minor --push
```

- `--push`: Push the git tag to origin after creation.
- `--cascade`: Also patch-bump all internal packages that depend on this one.
- `--skip-publish`: Run everything except the publish step.
- `--dist-tag <tag>`: Apply an npm dist-tag (e.g. `next`, `beta`).
- `--dry-run`: Preview all changes without executing them.

### Bump version only

```bash
bun run release-cli version packages/cli-kit patch --cascade
```

This bumps the version (and optionally cascades) without tagging, committing, or publishing.

### Create a tag

```bash
bun run release-cli tag packages/cli-kit --push
```

Creates an annotated tag for the package at its current version.

### Publish a package

```bash
bun run release-cli publish packages/cli-kit --tag next
```

Publishes the package to the npm registry.

### Publish all packages

```bash
bun run release-cli publish --all
```

Publishes every publishable package under `packages/` (excludes `tooling-config`).

---

## Bulk Publish (CI)

To publish all packages at once via GitHub Actions:

1. Go to **Actions → Release** in the GitHub UI.
2. Click **Run workflow**.
3. Check the **Publish packages** checkbox.
4. Click **Run workflow**.

The workflow runs:

```bash
./repo-cli gitdb:index
./release-cli publish --all
```

This publishes every publishable package and pushes all release tags.

**Releases never run automatically.** The workflow only triggers when you explicitly invoke it with `publish = true`.

---

## Registry Integration

Each package declares public access:

```json
{
  "name": "@axm-internal/cli-helper",
  "version": "0.1.0",
  "publishConfig": {
    "access": "public"
  }
}
```

The repository includes an `.npmrc` for publishing:

```txt
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

Add `NPM_TOKEN` as a repository secret under Settings > Secrets and variables > Actions.

---

## Changelogs

Changelogs are JSON-backed and rendered by repo-cli:

- JSON lives in `.changelogs/` (`root.json` and `<scope>.json` files).
- Markdown rendering writes `CHANGELOG.md` at the repo root and inside each package/app.
- Root changelog entries include unscoped commits only.

To generate both JSON and markdown:

```bash
./repo-cli gitdb:index
./repo-cli changelog:update --all
./repo-cli changelog:write --all
```

---

## The Philosophy

Releases are not mechanical side effects—they are *decisions*.

* Every version bump is explicit
* Every tag is intentional
* Every consumer opts in

This keeps `axm-internals` fast to evolve while remaining safe to depend on.
