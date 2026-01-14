# Prompt templates

These templates are rendered with Eta and use the `it` object.

Available placeholders:

- `<%= it.packagePath %>` — package path passed to the runner (e.g., `packages/zod-helpers`).
- `<%= it.outputPath %>` — output file path when the command writes a file (e.g., `packages/.../llms.txt` or `checklist.md`).

Only `checklist` and `llms` templates receive `outputPath`. The `typedoc` template receives only `packagePath`.
