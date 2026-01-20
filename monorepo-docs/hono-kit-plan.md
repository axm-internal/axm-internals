# Hono Kit Plan (Commit Chunks)

This plan breaks the work into dependency-ordered, committable chunks. Each chunk includes the goal, files touched, and a conventional commit message in past tense. Each chunk includes its own unit tests where applicable.

## 1) Scaffold package skeleton

- Goal: Create the canonical package structure and base metadata.
- Files:
  - `packages/hono-kit/package.json`
  - `packages/hono-kit/README.md`
  - `packages/hono-kit/docs/README.md`
  - `packages/hono-kit/llms.txt`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/.gitkeep`
  - `packages/hono-kit/tests/integration/.gitkeep`
- Commit: `chore(hono-kit): scaffolded package skeleton`

## 2) Core types, error types, and logger interface (+ unit tests)

- Goal: Establish shared types (auth, lifecycle, response envelope) and minimal logger contract.
- Files:
  - `packages/hono-kit/src/server/types.ts`
  - `packages/hono-kit/src/logging/logger.ts`
  - `packages/hono-kit/src/errors/errorTypes.ts`
  - `packages/hono-kit/src/errors/errorEnvelope.ts`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/errorEnvelope.test.ts`
- Commit: `feat(hono-kit): added core types and logger interface`

## 3) Logging adapters (+ unit tests)

- Goal: Provide Pino and console adapters for the logger interface.
- Files:
  - `packages/hono-kit/src/logging/pinoAdapter.ts`
  - `packages/hono-kit/src/logging/consoleAdapter.ts`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/loggerAdapter.test.ts`
- Commit: `feat(hono-kit): added logger adapters`

## 4) Validation errors and input validation (+ unit tests)

- Goal: Add validation error class, input validation utilities, and Zod error shaping.
- Files:
  - `packages/hono-kit/src/validation/validationError.ts`
  - `packages/hono-kit/src/validation/inputValidation.ts`
  - `packages/hono-kit/src/errors/errorEnvelope.ts`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/inputValidation.test.ts`
- Commit: `feat(hono-kit): implemented input validation and validation errors`

## 5) Response validation (data payload only) (+ unit tests)

- Goal: Validate response payload when `response` schema is provided.
- Files:
  - `packages/hono-kit/src/validation/responseValidation.ts`
  - `packages/hono-kit/src/errors/errorEnvelope.ts`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/responseValidation.test.ts`
- Commit: `feat(hono-kit): added response payload validation`

## 6) Route builder and route types (+ unit tests)

- Goal: Add `route()` builder and route metadata shape.
- Files:
  - `packages/hono-kit/src/routing/route.ts`
  - `packages/hono-kit/src/server/types.ts`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/route.test.ts`
- Commit: `feat(hono-kit): added route builder and route types`

## 7) RoutesCollection and registration (+ unit tests)

- Goal: Normalize route inputs (map/array) and register routes into Hono.
- Files:
  - `packages/hono-kit/src/server/RoutesCollection.ts`
  - `packages/hono-kit/src/routing/registerRoutes.ts`
  - `packages/hono-kit/src/server/types.ts`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/routesCollection.test.ts`
- Commit: `feat(hono-kit): added routes collection and registration`

## 8) Middleware defaults (+ unit tests)

- Goal: Add default middleware bundle and individual helpers.
- Files:
  - `packages/hono-kit/src/middleware/defaults.ts`
  - `packages/hono-kit/src/middleware/requestTracking.ts`
  - `packages/hono-kit/src/middleware/requestLogger.ts`
  - `packages/hono-kit/src/middleware/trimTrailingSlash.ts`
  - `packages/hono-kit/src/middleware/cors.ts`
  - `packages/hono-kit/src/middleware/secureHeaders.ts`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/middlewareDefaults.test.ts`
- Commit: `feat(hono-kit): added default middleware bundle`

## 9) Auth helpers (+ unit tests)

- Goal: Add bearer, query, and composite auth helpers + types.
- Files:
  - `packages/hono-kit/src/auth/bearerAuth.ts`
  - `packages/hono-kit/src/auth/queryAuth.ts`
  - `packages/hono-kit/src/auth/compositeAuth.ts`
  - `packages/hono-kit/src/auth/types.ts`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/auth.test.ts`
- Commit: `feat(hono-kit): added auth helpers`

## 10) HonoServer wrapper and createHonoServer (+ unit tests)

- Goal: Wire everything into the wrapper class with lifecycle hooks, auth enforcement, and envelope behavior.
- Files:
  - `packages/hono-kit/src/server/HonoServer.ts`
  - `packages/hono-kit/src/server/createHonoServer.ts`
  - `packages/hono-kit/src/server/types.ts`
  - `packages/hono-kit/src/index.ts`
  - `packages/hono-kit/tests/unit/server.test.ts`
- Commit: `feat(hono-kit): implemented server wrapper and factory`

## 11) Integration tests for server

- Goal: Validate full server behavior (middleware, auth, envelopes).
- Files:
  - `packages/hono-kit/tests/integration/server.test.ts`
- Commit: `test(hono-kit): added server integration tests`

## 12) Documentation + typedoc prep

- Goal: Document the public API and usage.
- Files:
  - `packages/hono-kit/README.md`
  - `packages/hono-kit/docs/README.md`
  - `packages/hono-kit/llms.txt`
- Commit: `docs(hono-kit): documented public api`

## 13) Changeset

- Goal: Add a changeset for the new package.
- Files:
  - `.changeset/*.md`
- Commit: `chore(hono-kit): added changeset`
