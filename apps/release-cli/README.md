# @axm-internal/release-cli

Version bumping, git tagging, npm publishing, and release orchestration.

## Usage

```bash
bun dev version packages/cli-kit patch --dry-run
bun dev version packages/cli-kit minor --cascade
bun dev tag packages/cli-kit --push
bun dev publish packages/cli-kit --tag next
bun dev publish --all
bun dev release packages/cli-kit minor --cascade --push
bun dev release packages/cli-kit patch --skip-publish
```

## Commands

- `version <packagePath> <bump>` — Bump a package's semver version.
  - `bump`: `patch`, `minor`, or `major`
  - `--cascade`: Also patch-bump all internal packages that depend on this one.
- `tag <packagePath>` — Create an annotated git tag for a package at its current version.
  - `--push`: Push the tag to origin after creation.
- `publish [packagePath]` — Publish a package to the npm registry.
  - `--all`: Publish all publishable packages under `packages/` (excludes `tooling-config`).
  - `--tag <dist-tag>`: Apply an npm dist-tag (e.g. `next`, `beta`).
- `release <packagePath> <bump>` — Full release orchestration: index, changelog update, changelog write, version bump, tag, commit, publish.
  - `--cascade`: Cascade version bumps to internal dependents.
  - `--push`: Push the git tag to origin.
  - `--skip-publish`: Run all steps except publishing.
  - `--dist-tag <tag>`: Apply an npm dist-tag during the publish step.

## Global Options

- `--dry-run`: Preview all changes without executing them.

## Scripts

- `bun dev` — Run the CLI.
- `bun run test` — Run unit tests.
- `bun run lint` — Run Biome linter.
- `bun run check-types` — Run TypeScript type checker.
