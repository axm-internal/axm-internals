# @axm-internal/git-db

SQLite-backed index of git commits and file changes for fast queries.

## Install

```bash
bun add @axm-internal/git-db
```

## Runtime setup

### Node

```ts
import { openNodeDb } from '@axm-internal/git-db';

const db = await openNodeDb('.git-db/database.sqlite');
```

### Bun

```ts
import { openBunDb } from '@axm-internal/git-db';

const db = await openBunDb('.git-db/database.sqlite');
```

### Bun (worker)

```ts
import { openBunWorkerDb } from '@axm-internal/git-db';

const db = await openBunWorkerDb('.git-db/database.sqlite');
```

## Query usage

```ts
import { findCommitsByMessage, openNodeDb } from '@axm-internal/git-db';

const db = await openNodeDb('.git-db/database.sqlite');
const commits = await findCommitsByMessage(db, 'feat');
```

Conventional commits note:
- The package name inside `feat(scope): ...` is the **scope**. Use the same scope text when doing message-based queries for a package.
- Example: if commits are written as `feat(cli-kit): add meta helpers`, then `cli-kit` is the scope to search for.

## CLI

```bash
git-db init --db .git-db/database.sqlite
git-db update --db .git-db/database.sqlite
git-db query --db .git-db/database.sqlite --message feat
git-db query --db .git-db/database.sqlite --author-search alice
git-db query --db .git-db/database.sqlite --list-commits --limit 25
git-db query --db .git-db/database.sqlite --list-files --limit 50
git-db query --db .git-db/database.sqlite --list-authors
git-db query --db .git-db/database.sqlite --list-meta
git-db query --db .git-db/database.sqlite --list-commits --json
```

When `--json` is omitted, results are rendered as tables using `cli-table3`.

## Notes

- Source-first, buildless package (Bun).
- Entry point: `src/index.ts`.
- Parent directories for the DB path are created automatically.
- Indexing APIs are currently internal; the public surface focuses on opening the DB and querying indexed data.
