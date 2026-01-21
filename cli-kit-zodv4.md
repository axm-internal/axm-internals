# cli-kit Zod v4 alignment (Issue #16)

Source: GitHub issue #16 opened January 19, 2026. citeturn0view0

## Context

Issue #16 audits `packages/cli-kit/src` for Zod v4 alignment and lists nine improvements spanning types, metadata usage, schema unwrapping, validation, and error messaging. It targets internal API usage (like `def.innerType` and raw `shape`), encourages v4-friendly access via `.def` and `schema.meta()`, and recommends replacing `z.custom` placeholders with real schema validation. citeturn0view0

## Current Code Scan (packages/cli-kit)

The following locations in `cli-kit` map directly to the issue items and show current v4-fragile patterns:

- `packages/cli-kit/src/registerCommandDefinition.ts`
  - Uses `z.ZodTypeAny` in `SchemaMeta` and `getSchemaMeta`.
  - Reads `description` and `def.description` instead of `schema.meta()`.
  - Uses `def.innerType` and a generic `unwrap()` shim for defaults/wrappers.
  - Accesses `shape` directly via a custom `getObjectShape` shim.
  - Uses `argPositions` for argument ordering (not schema meta).
- `packages/cli-kit/src/schemas/CliAppSchemas.ts`
  - `commandDefinitions: z.array(z.custom<CommandDefinition>())` (no shape validation).
- `packages/cli-kit/src/schemas/RegisterCommandDefinitionParamsSchema.ts`
  - `definition: z.custom<CommandDefinition>()` (no shape validation).
- `packages/cli-kit/src/schemas/CommandDefinitionSchemaFactory.ts`
  - `ZodObjectSchema` implemented with `z.custom` + `instanceof z.ZodObject` (no message).
- `packages/cli-kit/src/interfaces/ContainerInterface.ts`
  - `InjectionTokenSchema` and `ContainerSchema` implemented with `z.custom` (no messages).

## Issue Analysis (by item)

1) Replace `z.ZodTypeAny` with `z.ZodType` citeturn0view0
- File: `packages/cli-kit/src/registerCommandDefinition.ts` citeturn0view0
- Rationale: `ZodTypeAny` is discouraged in this repo; `ZodType` is tighter and v4-aligned. citeturn0view0
- Impact: Type-only change; should not alter runtime behavior.

2) Prefer `schema.meta()` and helpers over `description`/`def.description` citeturn0view0
- File: `packages/cli-kit/src/registerCommandDefinition.ts` (`getSchemaMeta`) citeturn0view0
- Rationale: v4 encourages `schema.meta()`, and repo guidance already provides helpers in `@axm-internal/zod-helpers`. citeturn0view0
- Impact: Potentially behavior-visible if consumers rely on `.describe()` or internal `def.description` instead of meta values.

3) Avoid `def.innerType` for wrapper unwrapping citeturn0view0
- File: `packages/cli-kit/src/registerCommandDefinition.ts` (`getSchemaMeta`) citeturn0view0
- Rationale: `def.innerType` is not stable; use `unwrap()` or helper for optional/default wrappers. citeturn0view0
- Impact: Internal refactor unless unwrapping logic changes (risk of different metadata source resolution).

4) Replace `z.custom<CommandDefinition>()` with real schema validation citeturn0view0
- File: `packages/cli-kit/src/schemas/CliAppSchemas.ts` (`commandDefinitions`) citeturn0view0
- Rationale: `z.custom` does not validate shape; use a schema (factory or `z.object`). citeturn0view0
- Impact: Behavior change; invalid definitions will start failing.

5) Improve `ZodObjectSchema` guard / error messaging citeturn0view0
- File: `packages/cli-kit/src/schemas/CommandDefinitionSchemaFactory.ts` citeturn0view0
- Rationale: current `z.custom` + `instanceof` is opaque; prefer `z.instanceof` or custom message. citeturn0view0
- Impact: Error messaging change; behavior unchanged if guard is equivalent.

6) Use metadata for option/arg descriptions and defaults consistently citeturn0view0
- File: `packages/cli-kit/src/registerCommandDefinition.ts` citeturn0view0
- Rationale: standardize on `schema.meta({ description, defaultValue })` once meta is source of truth. citeturn0view0
- Impact: Behavior change if existing `describe()` or default behavior differ.

7) Use metadata for argument ordering and option aliases citeturn0view0
- Files: `packages/cli-kit/src/registerCommandDefinition.ts`, `packages/cli-kit/src/schemas/CommandDefinitionSchemaFactory.ts` citeturn0view0
- Rationale: store `position` and `aliases` in meta to keep info co-located. citeturn0view0
- Impact: Behavioral change; data model change for how args/options are specified.

8) Stop using `shape` access; prefer `schema.def` checks citeturn0view0
- File: `packages/cli-kit/src/registerCommandDefinition.ts` citeturn0view0
- Rationale: `shape` is not stable; use `schema.def.type === "object"` then `schema.def.shape`. citeturn0view0
- Impact: Internal refactor; should be behavior-neutral if correct.

9) Add custom error messages for `z.custom` validators citeturn0view0
- Files: `packages/cli-kit/src/interfaces/ContainerInterface.ts`, `packages/cli-kit/src/schemas/CommandDefinitionSchemaFactory.ts` citeturn0view0
- Rationale: improve DX when validation fails. citeturn0view0
- Impact: Error message changes only.

## Implementation Plan (all items)

Each phase includes the code changes, tests, and docs required to complete that phase. Use the commit message listed for the phase.

Phase 0 -- Discovery
- Code:
  - Inventory Zod v4 usage in `packages/cli-kit/src` and map each issue item to files.
  - Review `@axm-internal/zod-helpers` for meta extraction and unwrapping helpers.
  - Identify public surface changes implied by metadata or validation shifts.
- Tests:
  - Identify tests that assert descriptions/defaults/arg ordering or rely on `describe()`.
- Docs:
  - Note README/Typedoc sections that mention `describe()`-based metadata.
- Done when:
  - A checklist exists linking every issue item to code locations and expected behavior changes.
- Commit message: `docs(cli-kit): mapped issue-16 scope and impacts`

Phase 1 -- Type and metadata alignment (low risk)
- Code:
  - Replace `z.ZodTypeAny` with `z.ZodType` in `registerCommandDefinition.ts`.
  - Update `getSchemaMeta` to use `schema.meta()` (via helpers) for description/defaults.
  - Standardize description/default extraction on metadata in registration.
- Tests:
  - Update/extend tests to assert metadata-driven description/defaults.
- Docs:
  - Update `packages/cli-kit/README.md` and `packages/cli-kit/docs/README.md` examples to show `schema.meta({ description, defaultValue })`.
- Done when:
  - No `ZodTypeAny` usage remains in `registerCommandDefinition.ts`.
  - No `describe()`/`def.description` usage remains in the CLI metadata path.
  - Docs and tests reflect metadata usage.
- Commit message: `refactor(cli-kit): used zod v4 metadata for descriptions`

Phase 2 -- Wrapper unwrapping and shape access (low risk)
- Code:
  - Replace `def.innerType` with safe unwrapping (`unwrap()` or helper).
  - Replace raw `shape` access with v4-safe `schema.def.type` checks and `schema.def.shape`.
- Tests:
  - Add tests for optional/default wrappers to ensure metadata still resolves correctly.
- Docs:
  - No doc change unless behavior changes; note in internal notes if helper usage is new.
- Done when:
  - No `innerType` or direct `shape` access remains in CLI code.
- Commit message: `refactor(cli-kit): avoided zod internals for unwrap/shape`

Phase 3 -- Validation correctness (behavior changes)
- Code:
  - Replace `z.custom<CommandDefinition>()` with a real schema in:
    - `CliAppSchemas.ts` (`commandDefinitions`)
    - `RegisterCommandDefinitionParamsSchema.ts` (`definition`)
  - Ensure schema uses `CommandDefinitionSchemaFactory` or equivalent.
- Tests:
  - Add tests that invalid command definitions now fail validation.
  - Update any tests that rely on loose `z.custom` behavior.
- Docs:
  - Add note in README about validation strictness for command definitions.
- Done when:
  - Invalid definitions are rejected by schema validation with helpful errors.
- Commit message: `feat(cli-kit): validated command definitions with real schemas`

Phase 4 -- Schema guards and error messaging (DX)
- Code:
  - Replace `ZodObjectSchema` guard with `z.instanceof(z.ZodObject)` or `z.custom` with explicit message.
  - Add explicit error messages to `InjectionTokenSchema` and `ContainerSchema`.
- Tests:
  - Add tests asserting error messages for invalid container/token inputs.
- Docs:
  - No doc change unless public error messages are documented.
- Done when:
  - All `z.custom` validators include helpful messages or are replaced with `z.instanceof`.
- Commit message: `chore(cli-kit): improved zod guard errors`

Phase 5 -- Metadata for ordering and aliases (behavior changes)
- Code:
  - Extend schema factory to read `position` and `aliases` from `schema.meta()`.
  - Update registration logic to use meta-based `position` and `aliases`.
  - Remove or deprecate `argPositions` if fully replaced by meta.
- Tests:
  - Add tests for argument ordering and option aliases via metadata.
  - Update existing tests using `argPositions` as needed.
- Docs:
  - Update README and Typedoc examples to show `meta({ position, aliases })`.
- Done when:
  - Ordering/aliases are derived from metadata, and docs/tests match.
- Commit message: `feat(cli-kit): supported meta-based arg positions and aliases`

Phase 6 -- Verification
- Code:
  - Ensure behavior changes are captured in a Changeset (if required).
- Tests:
  - Run unit + integration tests for `cli-kit`.
  - Ensure new tests cover metadata extraction, ordering/aliases, and validation failures.
- Docs:
  - Confirm docs match final behavior and metadata usage.
- Done when:
  - Tests pass, docs are updated, and Changeset exists if behavior/public API changed.
- Commit message: `chore(cli-kit): finalized zod v4 alignment`

## Phase Verification (current code)

Checked against the current `packages/cli-kit` sources:

Phase 1
- Verified: `registerCommandDefinition.ts` contains `z.ZodTypeAny` in `SchemaMeta`, `getSchemaMeta`, and field casts.
- Verified: `createCommandDefinition.ts` does not use `ZodTypeAny`.

Phase 2
- Verified: `registerCommandDefinition.ts` uses `def.innerType` and a `shape` shim.

Phase 3
- Verified: `CliAppSchemas.ts` and `RegisterCommandDefinitionParamsSchema.ts` use `z.custom<CommandDefinition>()`.

Phase 4
- Verified: `CommandDefinitionSchemaFactory.ts` uses `z.custom` for `ZodObjectSchema`.
- Verified: `ContainerInterface.ts` uses `z.custom` for `InjectionTokenSchema` and `ContainerSchema`.

Phase 5
- Verified: `registerCommandDefinition.ts` relies on `argPositions` (no meta-based ordering).

## Risk Notes

- Items 4, 6, and 7 are likely API/behavior changes (validation strictness and metadata source changes).
- Items 1, 3, 8, and 9 are primarily internal refactors and DX improvements.
- Items 2 and 6 could change exposed descriptions/defaults if consumers rely on `.describe()` or `def.description`.
