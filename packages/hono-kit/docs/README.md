# @axm-internal/hono-kit Documentation

## Overview

Hono Kit provides an opinionated server wrapper that standardizes request
validation, response envelopes, auth enforcement, and common middleware.

## Core API

- `createHonoServer(options)` creates a `HonoServer` wrapper.
- `route(params)` builds route definitions with optional schemas.
- `RoutesCollection` normalizes route inputs (object or array).

## Validation

- Input validation: `params`, `query`, `headers`, and `body` use Zod schemas.
- Response validation runs when a `response` schema is provided (validates `data`).
- Validation errors are normalized into the shared error envelope.

## Envelopes

- Successful JSON responses are wrapped as:
  `{ status: "success", requestId, data }`.
- Errors are wrapped as:
  `{ status: "error", requestId, statusCode, errorMessage, validationErrors?, errorStack? }`.
- 204/304 responses omit the body.

## Auth

- Configure auth at server creation (`auth.enabled`, `authAll`, `middleware`).
- Override per route using `authorized: true | false`.

## Middleware

Default middleware bundle includes:
- Trailing slash trim
- Request tracking (requestId, requestStartTime)
- Optional request logging (Pino)
- CORS and secure headers (opt-in)

## Public Exports

See `src/index.ts` for the definitive export list, including:
- Server wrapper and lifecycle types
- Route builder and route types
- Auth helpers
- Middleware helpers
- Validation helpers
- Response envelopes and errors

## Typedoc

Run `bun run docs` from `packages/hono-kit` to generate API docs.
