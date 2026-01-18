# Prompt templates

These templates are rendered with Eta and use the `it` object.

Available placeholders:

- `<%= it.packageName %>` — package path passed to the runner (e.g., `packages/zod-helpers`).

All templates receive only `packageName`. File writes should use paths relative to the repo root, which is provided to Codex via `--add-dir`.
