# NPM Registry Migration

## Goal

Publish `@axm-internal/*` packages to the npm public registry instead of GitHub Packages.

## Why

GitHub Packages requires auth for every install, scoping friction with registries, and no real benefit for internal tooling that will go public. npmjs.com is the default registry — zero config for consumers.

## Current State

- Registry: `https://npm.pkg.github.com`
- Auth: `.npmrc` with `GITHUB_TOKEN`
- Scope: `@axm-internal`
- Visibility: `restricted` (changeset config)
- Publish: `changesets/action` in `.github/workflows/release.yml`

## Required Changes

### 1. `.npmrc` — switch registry

**Before:**
```
@axm-internal:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**After:**
```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

Remove the `@axm-internal:registry=` line — npmjs.com is the default, so scoped registry override is unnecessary.

### 2. `package.json` — every publishable package

Remove `publishConfig.registry` from each `packages/*/package.json`:

```diff
- "publishConfig": {
-   "registry": "https://npm.pkg.github.com"
- }
```

Or replace it with npmjs.com access if you want explicit config:

```json
"publishConfig": {
  "access": "public"
}
```

`@axm-internal` is a scoped package. On npmjs.com, scoped packages default to restricted visibility. You **must** set `"access": "public"` or publishes will succeed but installs will 403 for unauthenticated users.

### 3. `.changeset/config.json` — open visibility

```diff
- "access": "restricted",
+ "access": "public",
```

### 4. GitHub secrets — add `NPM_TOKEN`

1. Create an npm automation token: https://www.npmjs.com/settings/tokens/create (type: **Automation**)
2. Add `NPM_TOKEN` as a repository secret: Settings > Secrets and variables > Actions > New repository secret

### 5. `.github/workflows/release.yml` — update publish step

Replace `GITHUB_TOKEN` with `NPM_TOKEN`:

```diff
  env:
-   GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
+   NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

If keeping changesets/action:

```yaml
- uses: changesets/action@v1
  with:
    version: bunx changeset version
    publish: bunx changeset publish
  env:
    NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

If replacing changesets (see `remove-changesets.md`), use `bun publish` instead.

### 6. Clean up GitHub Packages

After migration, existing versions on `npm.pkg.github.com` remain. Options:

- **Leave them** — they become stale; consumers switch to npmjs.com
- **Deprecate them** — `npm deprecate @axm-internal/<pkg>@<version> "Moved to npmjs.com"` per version
- **Delete the package** — via GitHub UI (destructive, irreversible)

Recommendation: deprecate each package on GitHub Packages once the first npmjs.com publish lands.

## Migration Order

1. Create `NPM_TOKEN` and add to GitHub secrets
2. Update `.npmrc`
3. Update all `package.json` publish configs
4. Update `.changeset/config.json` access
5. Update workflow files
6. Test publish with a single dry-run: `bun publish --dry-run` from a package dir
7. Publish a patch version of one package manually to verify
8. Deprecate GitHub Packages versions
9. Update `AGENTS.md`, `CLAUDE.md`, and `monorepo-docs/conventions.md` to reflect new registry