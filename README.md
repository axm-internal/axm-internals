# axm-internals

## Creating a new package

Use the Bun template:

```bash
bun create axm-package packages/<name>
```

You will be prompted for the package name and a short description. The template also creates
`docs/` and `llms.txt` to satisfy the documentation requirements.
Because the template installs dev dependencies, the post-create hook runs automatically and
removes its temporary `scripts/` folder.
It also removes the nested `.git` folder created by `bun create`.

## Packages

- `packages/cli-helper/README.md`
- `packages/zod-helpers/README.md`
- `packages/typescript-config/README.md`
- `apps/prompt-runner/README.md`

## Examples Repo

`axm-internals/axm-examples` is the companion repo for testing published `@axm-internal/*` packages.

## Docs

- `monorepo-docs/package-checklist.md`
- `monorepo-docs/intro-to-changesets.md`

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Releases

We use Changesets for versioning and publishing public `@axm-internal/*` packages.

Flow:

1. Make your changes.
2. Run `bun changeset` and select the packages + bump type.
3. Commit the changeset file with your code.
4. Merge to `main`.
5. The Release workflow runs and publishes updated packages.

See `monorepo-docs/intro-to-changesets.md` for details.

## Coverage

To generate coverage for all packages/apps and upload to Codecov:

```bash
bun coverage:upload
```

## Maintenance

To clean build artifacts, caches, and test outputs:

```bash
./scripts/clean
```

Or use the root script:

```bash
bun clean
```

## Package Installation

`@axm-internal/*` packages are public and published to GitHub Packages. GitHub Packages
still requires authentication for installs, so consumers must configure an auth token.

Local setup (one-time):

```bash
echo "@axm-internal:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc
```

Then install as usual:

```bash
bun add @axm-internal/zod-helpers
```

CI setup should write the token to the repo `.npmrc` and include `packages: read`
permissions for the workflow.
