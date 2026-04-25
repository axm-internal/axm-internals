# Release CLI Migration Checklist

Track progress for the release-cli migration. Check items off as completed.

## Phase 1: Dependency Audit & Cleanup

### Step 1: Create `@axm-internal/cli-tools`

- [x] 1.1 Scaffold `packages/cli-tools` — `feat/packages/cli-tools`
- [x] 1.2 Move `renderJson` into cli-tools — (included above)
- [x] 1.3 Move `buildCliTable` into cli-tools — (included above)
- [x] 1.4 Move `truncateString` into cli-tools — (included above)
- ~~1.5 Move `formatDate` into cli-tools~~ — N/A: function doesn't exist in source yet
- [x] 1.6 Export all utilities from `src/index.ts` — (included above)
- [x] 1.7 Update git-db imports to use `@axm-internal/cli-tools` — `feat/git-db/use-cli-tools`
- [x] 1.8 Update repo-cli imports to use `@axm-internal/cli-tools` — `feat/repo-cli/use-cli-tools`

### Step 2: Clean up git-db

- [x] 2.1 Add `listReleaseTags(scope?)` function — `feat/git-db/tag-queries`
- [x] 2.2 Add `getLatestReleaseTagForScope(scope)` function — (included above)
- [x] 2.3 Add `resolveTag(tagName)` function — (included above)
- [x] 2.4 Add `findCommitsBetweenHashes(fromHash, toHash, scope?)` function — `feat/git-db/range-queries`
- [x] 2.5 Add `findCommitsByScopeAndPath(scope, pathPrefix)` function — `feat/git-db/scope-path-queries`
- [x] 2.6 Replace deep `renderJson` export with cli-tools import — (step 1.7)

### Step 3: Enhance schema-orm

- [x] 3.1 Add drizzle escape hatch (`getDrizzleDb()`, `getTable()`) — `feat/schema-orm/drizzle-escape-hatch`
- [x] 3.2 Rewrite `upsert()` to use `onConflictDoUpdate()` — (included above)
- [x] 3.3 Implement composite primary keys (DDL + drizzle adapter) — (included above)
- [x] 3.4 Add advanced WHERE operators (`WhereOperator<T>`) — (included above)
- [x] 3.5 Add foreign key support (DDL + schema meta) — (included above)

### Step 4: Clean up repo-cli

- [x] 4.1 Replace deep import of `renderJson` with `@axm-internal/cli-tools` — `refactor/repo-cli/cli-tools-imports`
- [x] 4.2 Replace raw Kysely query in GitQuery with `findCommitByHash` from git-db — `refactor/repo-cli/delegate-to-git-db`
- [x] 4.3 Remove `ora` from package.json — `chore/repo-cli/remove-ora`
- [x] 4.4 Remove duplicate utilities (import from cli-tools) — `refactor/repo-cli/remove-duplicate-utils`
- [x] 4.5 Replace tsyringe with InMemoryContainer — `refactor/repo-cli/replace-tsyringe`
- [x] 4.6 Remove `ChangeSetBuilder`, `ChangeSetWriter`, `changesets:create` command — `refactor/repo-cli/remove-changeset-commands`

### Step 5: Clean up cli-kit

- [x] 5.1 Add `logWarning` to CliOutputService — `feat/cli-kit/log-warning`
- [x] 5.2 Add `--dry-run` global option and `dryRun` on CommandContext — `feat/cli-kit/dry-run`

## Phase 2: Ultimate Release Solution

### Step 6: Create release-cli

- [ ] 6.1 Scaffold `apps/release-cli` — `feat/apps/release-cli-scaffold`
- [ ] 6.2 Implement `VersionService` + `version` command — `feat/release-cli/version-cmd`
- [ ] 6.3 Implement `TagService` + `tag` command — `feat/release-cli/tag-cmd`
- [ ] 6.4 Implement `PublishService` + `publish` command — `feat/release-cli/publish-cmd`
- [ ] 6.5 Implement `ReleaseService` + `release` command (orchestration) — `feat/release-cli/release-cmd`

### Step 7: Remove changesets

- [ ] 7.1 Remove `@changesets/cli` from root package.json — `chore/remove-changesets`
- [ ] 7.2 Delete `.changeset/`, `.changeset-drafts/` — (included above)
- [ ] 7.3 Remove `release-pr.yml` workflow — (included above)
- [ ] 7.4 Rewrite `release.yml` to use release-cli — `chore/rewrite-release-workflow`

### Step 8: Migrate to npmjs.com

- [ ] 8.1 Follow steps in `npm-registry.md` — `chore/npmjs-migration`
- [ ] 8.2 Update all publish configs to `"access": "public"` — (included above)
- [ ] 8.3 Update `.npmrc` to use `NPM_TOKEN` — (included above)
- [ ] 8.4 Test publish with a single package — (included above)
- [ ] 8.5 Deprecate GitHub Packages — (included above)

### Step 9: Clean up monorepo-docs

- [ ] 9.1 Follow steps in `monorepo-docs-cleanup.md` — `docs/cleanup-monorepo-docs`
- [ ] 9.2 Rewrite release docs — (included above)
- [ ] 9.3 Update AGENTS.md and CLAUDE.md — (included above)