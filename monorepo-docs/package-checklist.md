# Package Dev-Complete Checklist

Use this checklist before considering a package “dev complete.”

## Structure & Metadata

- `package.json` matches the canonical shape (name, type, main, publishConfig).
- Description is accurate and in sentence case.
- `tsconfig.json` extends the correct shared config.
- `docs/` directory exists.
- `llms.txt` exists at package root.

## Code & Tests

- Public API exported from `src/index.ts`.
- Tests exist under `tests/` and cover key behavior.
- `bun run test` passes for the package.

## Documentation

- `README.md` describes purpose and usage.
- `README.md` includes a “Docs” section pointing to `docs/` and `bun run docs`.
- Typedoc config exists (`typedoc.json`) and `bun run docs` succeeds.
- `llms.txt` is accurate (purpose, surface, usage, non-goals, stability).

## Quality Gates

- `bun run lint` passes.
- `bun run check-types` passes.
- `bun run validate` passes.
- If the package or app has tests, it is added to the coverage matrix in `.github/workflows/coverage.yml`.

## Promotion Readiness (if publishing)

- At least one published version exists.
- Changeset added for meaningful changes.
- Package is not marked `private` (unless explicitly non-published).

## Codex Skills (Optional)

When working with Codex, you can invoke the reusable skills created for this repo:

- Use **typedoc-docblocks** to add or improve Typedoc/TSDoc docblocks.
- Use **llms-txt-generator** to generate or refresh `llms.txt` content.
