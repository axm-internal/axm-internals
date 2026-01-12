# axm‑internals – Release & Versioning Pipeline

This document defines how internal packages in `axm‑internals` are versioned and released.

The goals are:

* Per‑package versioning in a monorepo
* Zero surprise breakage for consuming projects
* Clear, intentional upgrades
* Automated changelogs
* Seamless publishing to GitHub Packages

The chosen tool for this is **Changesets**.

---

## Why Changesets

Changesets is designed specifically for multi‑package monorepos. It provides:

* Package‑level versioning
* Human‑authored change intent
* Automatic changelog generation
* CI‑driven publishing
* Compatibility with any registry

It fits the axm‑internals philosophy:

> Changes are intentional. Promotion is explicit. Nothing breaks by surprise.

Unlike ad‑hoc version bumps or single‑version monorepos, Changesets lets each package evolve independently while living in one repository.

---

## Mental Model

Every meaningful change to a package includes a **changeset**:

```bash
bunx changeset
```

This creates a small markdown file describing:

* Which packages changed
* Whether the change is `patch`, `minor`, or `major`
* A human explanation of what changed

Example:

```md
---
"@axm/cli-helper": minor
---

Add structured logging and improve error output.
```

Changesets become the source of truth for:

* Version bumps
* Changelog entries
* Release notes

---

## Publishing Flow

1. Developer makes changes to one or more packages
2. Developer runs `bunx changeset`
3. A changeset file is committed with the code
4. Code is merged into `main`
5. GitHub Actions runs:

    * Tests
    * Coverage
    * Quality checks
    * `changesets/action`
6. Changesets:

    * Bumps package versions
    * Generates changelogs
    * Publishes only affected packages
7. Packages are pushed to **GitHub Packages**
8. A release commit and tags are created

Projects consuming `@axm/*` now have new versions available and can upgrade intentionally.

---

## GitHub Packages Integration

Each package declares its registry:

```json
{
  "name": "@axm/cli-helper",
  "version": "0.1.0",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

The repository includes an `.npmrc`:

```txt
@axm:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

GitHub Actions automatically provides `GITHUB_TOKEN`, enabling secure publishing without secrets.

---

## CI Release Workflow (Conceptual)

```yaml
name: Release

on:
  push:
    branches: [main]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1

      - run: bun install

      - run: bun test

      - name: Version & Publish
        uses: changesets/action@v1
        with:
          publish: bunx changeset publish
```

This job:

* Detects pending changesets
* Versions affected packages
* Publishes only what changed
* Commits updated versions and changelogs

---

## The Philosophy

Releases are not mechanical side effects—they are *decisions*.

* Every change declares its intent
* Every version bump is explicit
* Every consumer opts in

This keeps `axm‑internals` fast to evolve while remaining safe to depend on.

It scales from a single package to dozens without changing the workflow—only the number of changesets grows.
