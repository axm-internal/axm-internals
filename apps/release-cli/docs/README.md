# @axm-internal/release-cli Documentation

## Architecture

The release CLI is composed of four commands backed by four services:

### Commands

| Command | Purpose |
|---------|---------|
| `version` | Bump a single package version or cascade to dependents. |
| `tag` | Create and optionally push a git tag for a package. |
| `publish` | Publish one or all publishable packages to npm. |
| `release` | Full orchestration of the entire release flow. |

### Services

| Service | Responsibility |
|---------|---------------|
| `VersionService` | Read and write `package.json` versions, perform semver bumps, cascade bumps to internal dependents. |
| `TagService` | Create annotated git tags (`@axm-internal/<scope>@<version>`), check tag existence, push to origin. |
| `PublishService` | Run `bun publish --access public`, support `--tag` and `--dry-run`, bulk publish all packages. |
| `ReleaseService` | Orchestrate the full release: index commits, update changelogs, bump version, tag, commit, publish. |

### Release Flow

1. **Index** — Run `repo-cli gitdb:index` to update the SQLite commit index.
2. **Changelog Update** — Run `repo-cli changelog:update` for the target package.
3. **Changelog Write** — Run `repo-cli changelog:write` to render markdown.
4. **Version Bump** — Bump the package version (and optionally cascade to dependents).
5. **Tag** — Create an annotated git tag for the new version.
6. **Commit** — Stage all changes and commit with `chore(release): <scope>@<version>`.
7. **Publish** — Publish the package to the npm registry.

### Dry Run Mode

All commands respect `--dry-run`. In dry-run mode, no side effects are executed (no file writes, no git tags, no commits, no publishes). The CLI prints a preview of what would happen.
