# Bun create templates

This folder contains local `bun create` templates for the monorepo.

## Using a template

```bash
bun create axm-package packages/<name>
```

Notes:

- Templates live under `.bun-create/<template-name>/`.
- `bun create <template-name> <dest>` copies the template into `<dest>`.
- For local templates, Bun automatically updates `package.json` `name` to match the destination folder unless overridden by a template script.

## Template specifics: `axm-package`

The `axm-package` template creates:

- Canonical `package.json` (ESM, `src/index.ts`, GitHub Packages registry)
- `src/index.ts`
- `tests/unit/example.test.ts`
- `README.md`
- `docs/README.md`
- `llms.txt`

It also installs dev dependencies and runs a `postinstall` script (Node) that:

- Prompts for package name (defaults to `@axm/<folder-name>`)
- Prompts for a short description
- Rewrites tokens in `README.md`, `llms.txt`, and `docs/README.md`
- Removes the `bun-create` block from `package.json`
- Deletes the template-only `scripts/` folder
- Removes the nested `.git` folder created by `bun create`

If prompts do not appear (non-interactive shell), you can set:

- `AXM_PACKAGE_NAME`
- `AXM_PACKAGE_DESC`

Example (non-interactive):

```bash
AXM_PACKAGE_NAME=@axm/http-helper \
AXM_PACKAGE_DESC="HTTP helpers for internal services." \
bun create axm-package packages/http-helper
```

## Creating a new template

1. Create a new folder under `.bun-create/<template-name>/`.
2. Add the files you want scaffolded.
3. Optional: add a `bun-create` block in `package.json` to run `preinstall` or `postinstall`.
4. Document the template in this README.

Example `package.json` snippet:

```json
{
  "bun-create": {
    "postinstall": "node scripts/postcreate.cjs"
  }
}
```

## Modifying an existing template

- Edit files in `.bun-create/<template-name>/` directly.
- If you change template tokens (e.g. `__PACKAGE_NAME__`), update the script that replaces them.
- Keep the canonical `package.json` fields aligned with `monorepo-docs/conventions.md`.

## Troubleshooting

- If `bun create` cannot find a template, ensure `.bun-create/` exists at repo root and the template folder name matches.
- If prompts do not appear, check the `bun-create` script path and that it is executable by Bun.
