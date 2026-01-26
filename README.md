# axm-internals

## Creating a new package

Use the Bun template:

```bash
bun create axm-package packages/<name>
```

This uses the local `.bun-create/axm-package` template at the repo root.

You will be prompted for the package name and a short description. The template also creates
`docs/` and `llms.txt` to satisfy the documentation requirements.
Because the template installs dev dependencies, the post-create hook runs automatically and
removes its temporary `scripts/` folder.
It also removes the nested `.git` folder created by `bun create`.

## Packages

- [`packages/cli-kit/README.md`](./packages/cli-kit/README.md)
- [`packages/zod-helpers/README.md`](./packages/zod-helpers/README.md)
- [`packages/tooling-config/README.md`](./packages/tooling-config/README.md)
- [`apps/prompt-runner/README.md`](./apps/prompt-runner/README.md)
- [`apps/repo-cli/README.md`](./apps/repo-cli/README.md)

## Examples Repo

[`axm-internal/axm-examples`](https://github.com/axm-internal/axm-examples) is the companion repo for testing published `@axm-internal/*` packages.

## Docs

- [`monorepo-docs/package-checklist.md`](./monorepo-docs/package-checklist.md)
- [`monorepo-docs/intro-to-changesets.md`](./monorepo-docs/intro-to-changesets.md)

## Repo CLI

Use the root `repo-cli` helper to run monorepo CLI workflows:

```bash
./repo-cli prompt:checklist packages/zod-helpers
```

See [`apps/repo-cli/README.md`](./apps/repo-cli/README.md) for the full command list.

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

See [`RELEASING.md`](./RELEASING.md) for manual release instructions using `./repo-cli`.

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
