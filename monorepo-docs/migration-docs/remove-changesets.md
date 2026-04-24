# Remove Changesets

## Goal

Remove `@changesets/cli` and all changeset infrastructure. Replace with a simpler, Bun-native versioning and publishing workflow.

## Why

Changesets is over-engineered for this repo:
- Extra markdown files for every change (`.changeset/*.md`)
- A whole CI gating mechanism (`.release/ready`) just to trigger a publish
- `changesets/action` is a heavy GitHub Action that versions, commits, and publishes in one shot
- The repo already has `repo-cli` generating JSON changelogs — changeset changelogs are unused (`changelog: false` in config)
- Two-step release dance (release PR, then publish) adds friction for a small internal monorepo

## What Changesets Currently Does

1. **Version bumping** — reads `.changeset/*.md`, bumps `package.json` versions
2. **Publishing** — runs `npm publish` per package
3. **Release gating** — `.release/ready` marker triggers the publish workflow
4. **Changelog generation** — disabled (`"changelog": false`); repo uses `repo-cli changelog:write` instead

## Replacement: `bun publish` + `repo-cli`

### Version Bumping

Use `repo-cli` or a simple script to bump versions. No markdown files needed — decide the bump type and run it.

Add a new `repo-cli` command (or standalone script):

```bash
# Bump a single package
./repo-cli version <package> <patch|minor|major>

# Bump all packages with changes
./repo-cli version --all <patch|minor|major>
```

This updates `package.json` versions and optionally writes changelog entries.

### Publishing

Replace `changesets/action` with a direct `bun publish` step:

```yaml
- name: Publish packages
  run: |
    for pkg in packages/*/; do
      if [ -f "$pkg/package.json" ]; then
        private=$(node -e "console.log(require('$pkg/package.json').private || false)")
        if [ "$private" = "true" ]; then
          echo "Skipping private package: $pkg"
          continue
        fi
        cd "$pkg"
        bun publish --access public
        cd -
      fi
    done
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Or use `repo-cli` to orchestrate:

```bash
./repo-cli publish --all
```

### Release Workflow

Replace the two-workflow dance (release-pr.yml + release.yml) with a single workflow:

```yaml
name: Release

on:
  workflow_dispatch:
    inputs:
      bump:
        description: "Version bump type"
        required: true
        default: "patch"
        type: choice
        options: [patch, minor, major]
      packages:
        description: "Packages to release (comma-separated, or 'all')"
        required: true
        default: "all"

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v6
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run validate
      - run: ./repo-cli version ${{ inputs.packages }} ${{ inputs.bump }}
      - run: ./repo-cli changelog:update --all
      - run: ./repo-cli changelog:write --all
      - run: ./repo-cli publish --all
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git commit -m "chore(release): published packages"
          git push
```

## Files to Remove

| Path | Reason |
|------|--------|
| `.changeset/config.json` | Changeset configuration |
| `.changeset/*.md` | All changeset files (if any exist) |
| `.changeset-drafts/` | Draft changesets |
| `.release/` | Release marker directory |
| `monorepo-docs/release-versioning-pipeline.md` | Changeset-specific docs |
| `monorepo-docs/archived/intro-to-changesets.md` | Already archived |
| `monorepo-docs/archived/changeset-scripts.md` | Already archived |

## Files to Modify

| Path | Change |
|------|--------|
| `package.json` | Remove `@changesets/cli` from devDependencies |
| `.github/workflows/release.yml` | Replace changesets/action with bun publish |
| `.github/workflows/release-pr.yml` | Simplify or merge into release.yml |
| `AGENTS.md` | Remove changeset references, update release pipeline docs |
| `CLAUDE.md` | Remove changeset commands, update release pipeline |
| `monorepo-docs/conventions.md` | Remove changeset versioning references |
| `apps/repo-cli/src/commands/changesets/` | Remove changeset-specific commands |
| `apps/repo-cli/src/services/ChangeSetBuilder.ts` | Remove |
| `apps/repo-cli/src/services/ChangeSetWriter.ts` | Remove |

## Migration Order

1. Add `repo-cli version` and `repo-cli publish` commands
2. Add `NPM_TOKEN` secret to GitHub (see `npm-registry.md`)
3. Update release workflow to use `bun publish` + `repo-cli`
4. Remove release-pr workflow (no longer needed)
5. Test: manually trigger release workflow with a patch bump
6. Remove `@changesets/cli` from root `package.json`
7. Delete `.changeset/`, `.changeset-drafts/`, `.release/`
8. Remove changeset-related repo-cli code
9. Update all docs
10. Remove changeset-related archived docs