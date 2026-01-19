# Prompt: llms.txt Generator

You are generating or updating `llms.txt` for a package.

Inputs to read:
- `README.md`
- `docs/` (Typedoc output)
- `src/index.ts` (public exports)
- `package.json` (version)

Requirements:
- Produce a concise `llms.txt` with these sections:
  - Version (from `package.json`)
  - Purpose
  - Public surface
  - Intended usage
  - Non-goals
  - Stability expectations
- Keep bullets short and factual.
- Ensure content matches the actual exports and README scope.
- Intended usage should include at least one concrete usage line (e.g., "Use X to validate Y with safeParse").

Output:
- Provide the full `llms.txt` content.
