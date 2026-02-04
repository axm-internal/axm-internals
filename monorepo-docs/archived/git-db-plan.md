# git-db Plan

## Overview

`@axm-internal/git-db` provides a SQLite-backed index of git commits and file changes to enable fast, repeatable queries without re-reading the entire git history each run. It targets monorepos where query performance and incremental updates matter. The package uses a single built-in SQLite driver/dialect and accepts only a database path (or directory + name) from the user.

Core responsibilities:
- Initialize a SQLite database in a repo.
- Index commit metadata and changed files.
- Incrementally update the index using the last indexed commit.
- Provide a query API over commits and files.

Non-goals:
- Publishing or tagging releases.
- Rewriting git history or modifying git state.
- Replacing git log for one-off CLI usage.

## Proposed File Architecture

```
packages/git-db/
  README.md
  llms.txt
  package.json
  src/
    index.ts
    cli/
      index.ts
      schemas.ts
      commands/
        init.ts
        query.ts
        update.ts
        index.ts
    db/
      client.ts
      migrations.ts
      schema.ts
      types.ts
      meta.ts
      paths.ts
      database.ts
      database-bun.ts
      database-bun-worker.ts
      database-node.ts
    git/
      log.ts
      files.ts
      types.ts
    indexer/
      commitIndexer.ts
      commitScanner.ts
      types.ts
    queries/
      authorQueries.ts
      commitQueries.ts
      fileQueries.ts
      metaQueries.ts
      packageQueries.ts
    utils/
      parseConventionalCommit.ts
      dataRenderer.ts
      buildCliTable.ts
      truncateString.ts
```

## Database Schema (v1)

Tables:
- `authors`
  - `id` (primary key)
  - `name`
  - `email` (unique)
- `commits`
  - `hash` (primary key)
  - `author_id` (foreign key to authors.id)
  - `date` (ISO string)
  - `message`
  - `body`
  - `refs` (nullable)
  - `type` (nullable, parsed from conventional commits)
  - `scope` (nullable, parsed from conventional commits)
  - `is_breaking_change` (nullable, true when `!` is present)
- `commit_files`
  - `hash` (foreign key to commits.hash)
  - `path`
  - `status` (A/M/D/R)
  - composite primary key `(hash, path)`
- `meta`
  - `key`
  - `value`

Indexes:
- `authors(email)`
- `commits(date)`
- `commits(message)`
- `commits(type)`
- `commits(scope)`
- `commit_files(path)`
- `commit_files(hash)`

Meta keys:
- `last_indexed_hash`
- `last_indexed_date`
- `schema_version`

## Public API (initial)

### Types

```ts
export type { DbClient, RepoIndexState } from './db/client';
export type { Author, Commit, CommitFile, MetaEntry } from './db/types';
export type { CommitScanResult } from './indexer/types';
```

### Functions

```ts
// db
export { openBunDb, openBunWorkerDb, openNodeDb } from './db/client';

// indexer
export { scanCommits } from './indexer/commitScanner';

// queries
export { findAuthors, listAuthors } from './queries/authorQueries';
export {
  findCommitsBetween,
  findCommitsByAuthorEmail,
  findCommitsByMessage,
  findCommitsByScope,
  findCommitsByType,
  listCommits,
} from './queries/commitQueries';
export { findCommitsByPath, listFiles } from './queries/fileQueries';
export { listMeta } from './queries/metaQueries';
export { findCommitsByPackage } from './queries/packageQueries';
```

## CLI Commands (v1)

- CLI is included in v1.
- Planned commands:
  - `git-db init` -> create DB + schema
  - `git-db update` -> incremental update
  - `git-db query` -> ad-hoc query (message/path/type/scope)

## Implementation Plan

1) **Scaffold package**
   - Goal: Create the package shell and baseline docs.
   - Files:
     - `packages/git-db/package.json`
     - `packages/git-db/README.md`
     - `packages/git-db/llms.txt`
     - `packages/git-db/src/index.ts`
   - Tests:
     - Add a placeholder test file under `packages/git-db/tests/unit/` to establish the test layout.
   - Commit message: `chore(git-db): scaffolded package structure`

2) **Define DB schema + migration**
   - Goal: Define schema with Kysely's schema builder and provide init helpers.
   - Files:
     - `packages/git-db/src/db/database.ts`
     - `packages/git-db/src/db/database-node.ts`
     - `packages/git-db/src/db/database-bun.ts`
     - `packages/git-db/src/db/database-bun-worker.ts`
     - `packages/git-db/src/db/schema.ts`
     - `packages/git-db/src/db/migrations.ts`
     - `packages/git-db/src/db/client.ts`
     - `packages/git-db/src/index.ts` (export init/open helpers)
   - Notes:
     - Bun factory uses `@meck93/kysely-bun-sqlite`.
   - Tests:
     - `packages/git-db/tests/unit/db/migrations.test.ts`
     - `packages/git-db/tests/unit/db/client.test.ts`
   - Commit message: `feat(git-db): added database schema and init helpers`

3) **Git readers**
   - Goal: Read commit metadata and file changes from git using `execa`.
   - Files:
     - `packages/git-db/src/git/log.ts`
     - `packages/git-db/src/git/files.ts`
     - `packages/git-db/src/types/commit.ts`
     - `packages/git-db/src/index.ts` (export readers)
   - Notes:
     - Skip merge commits by default.
     - Normalize author identity to `{ name, email }` and lowercase emails.
     - Use `git log` and `git show --name-status` via `execa`.
   - Tests:
     - `packages/git-db/tests/unit/git/log.test.ts`
     - `packages/git-db/tests/unit/git/files.test.ts`
   - Commit message: `feat(git-db): added git readers for commits and files`

4) **Indexer**
   - Goal: Persist commits/authors/files into the SQLite DB and track the last indexed hash.
   - Files:
     - `packages/git-db/src/indexer/commitIndexer.ts`
     - `packages/git-db/src/indexer/commitScanner.ts`
     - `packages/git-db/src/db/client.ts` (index state helpers)
     - `packages/git-db/src/index.ts` (export indexer)
   - Tests:
     - `packages/git-db/tests/unit/indexer/commitIndexer.test.ts`
     - `packages/git-db/tests/unit/indexer/commitScanner.test.ts`
   - Commit message: `feat(git-db): indexed commits, authors, and files`

5) **Query layer**
   - Goal: Provide stable query helpers for messages, paths, ranges, and authors.
   - Files:
     - `packages/git-db/src/queries/commitQueries.ts`
     - `packages/git-db/src/queries/authorQueries.ts`
     - `packages/git-db/src/queries/fileQueries.ts`
     - `packages/git-db/src/queries/packageQueries.ts`
     - `packages/git-db/src/queries/metaQueries.ts`
     - `packages/git-db/src/utils/dataRenderer.ts`
     - `packages/git-db/src/utils/truncateString.ts`
     - `packages/git-db/src/index.ts` (export queries)
   - Tests:
     - `packages/git-db/tests/unit/queries/commitQueries.test.ts`
     - `packages/git-db/tests/unit/queries/authorQueries.test.ts`
     - `packages/git-db/tests/unit/queries/fileQueries.test.ts`
     - `packages/git-db/tests/unit/queries/packageQueries.test.ts`
     - `packages/git-db/tests/unit/queries/metaQueries.test.ts`
     - `packages/git-db/tests/unit/utils/dataRenderer.test.ts`
     - `packages/git-db/tests/unit/utils/truncateString.test.ts`
   - Commit message: `feat(git-db): added query helpers for commits and files`

6) **Integration test**
   - Goal: Validate end-to-end indexing and queries on a temp git repo.
   - Files:
     - `packages/git-db/tests/integration/indexer.test.ts`
   - Commit message: `test(git-db): added end-to-end indexer coverage`

7) **Docs**
   - Goal: Document usage, API surface, and non-goals.
   - Files:
     - `packages/git-db/README.md`
     - `packages/git-db/llms.txt`
   - Commit message: `docs(git-db): documented usage and API surface`

8) **CLI**
   - Goal: Provide a minimal CLI for init, update, and query.
   - Files:
     - `packages/git-db/src/cli/index.ts`
     - `packages/git-db/src/cli/commands/init.ts`
     - `packages/git-db/src/cli/commands/update.ts`
     - `packages/git-db/src/cli/commands/query.ts`
     - `packages/git-db/src/index.ts` (export CLI entry if needed)
   - Tests:
     - `packages/git-db/tests/unit/cli/init.test.ts`
     - `packages/git-db/tests/unit/cli/update.test.ts`
     - `packages/git-db/tests/unit/cli/query.test.ts`
   - Commit message: `feat(git-db): added cli commands`

Default DB location: `.git-db/database.sqlite` with optional override path.
- Parent directories for the DB path are created automatically.
- Message search escapes `%` and `_` so user input is treated as literal text (wildcards not supported).
