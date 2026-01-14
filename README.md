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

## Docs

- `monorepo-docs/package-checklist.md`

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.
