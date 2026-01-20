# Hono Server Wrapper - Feature Draft

## Summary

We want a new package that makes creating a Hono server dead simple, with an opinionated set of defaults and a single
entry point: `createHonoServer(...)`. It should feel similar to `packages/cli-kit`, but for HTTP servers with Zod-first
validation instead of decorators. The wrapper is API-first but allows HTML routes when needed.

This document lists proposed features, decisions, and a plan to ship the first version.

## Goals

- Single, opinionated entry point that creates a Hono app with sane defaults.
- Zod-first route validation (params, query, headers, body) without decorators.
- Easy opt-in or opt-out for default middleware (trim trailing slash, etc.).
- Lifecycle hooks for start/stop events and startup tasks.
- Consistent auth helpers and security middleware.
- Configuration object that stays small and obvious.

## Non-Goals (for v0)

- Competing with full frameworks or router DSLs.
- Introducing build steps or custom runtimes.
- Deep DI integration (keep composition simple).
- Auto-generated OpenAPI and client SDK in v0 (but plan for it).

## Decisions (Round 3)

- Package name: `packages/hono-kit`.
- `route()` supports two styles:
    - Object map: infer `method` and `path` from the routes object.
    - Array list: each route entry specifies `method` and `path` explicitly.
- Response validation: global toggle + per-route override.
- Shared error/response schema (details below).
- Auth defaults: global toggle for all routes + per-route `authorized` overrides.
- Response validation default: enabled by default, but user can disable in `createHonoServer`.

## Decisions (Round 4)

- Response validation is enabled by default until the user disables it explicitly.
- Error schema uses enum-like `errorType` plus optional `errorCode` for finer-grained cases.
- `validationErrors` uses standardized string paths (dot/bracket notation).
- Auth global toggle name: `authAll`.
- Success `data` allows `null` (e.g., 204/304 scenarios).

## Decisions (Round 5)

- No prod warning for response validation; document behavior instead.
- Keep `errorType` enum small, aligned with Hono `HTTPException` categories.
- Validation errors are simple `{ path, message }` objects; a class with `toJSON()` can enrich later.
- For 204/304, omit the body entirely.
- Auth override behavior: if `route().authorized` is set but auth is globally disabled, throw at startup.

## Decisions (Round 6)

- Map `errorType` directly to Hono `HTTPException` status groups.
- Constrain `errorCode` per `errorType`.
- Use either routes object or routes array per server (no mixing).
- Response validation runs only when a route defines `response` schema.

## Decisions (Round 7)

- Response validation always runs when a route provides a `response` schema (no MVP toggle).
- Routes are normalized into an internal `RoutesCollection` regardless of map/array input.
- `.mount()` can be called multiple times with map or array; everything normalizes into `RoutesCollection`.

## Decisions (Round 8)

- `errorCode` remains optional for all error types.
- `RoutesCollection` should be exposed as a readonly type for inspection.

## Decisions (Round 9)

- Use union types to constrain `errorCode` per `errorType`.
- Enforce the success envelope even when a route lacks a response schema (except 204/304).

## Decisions (Round 10)

- Enforced envelopes apply only to JSON responses.
- `response` schemas validate only the `data` payload (not the envelope).
- `RoutesCollection` should expose a `toJSON()` for inspection.

## Decisions (Round 11)

- Derive `errorType` from HTTP status via `errorTypeFromStatus(status)`.
- For JSON responses without a response schema, always wrap with the envelope; allow a future opt-out flag but default is always.
- `RoutesCollection.toJSON()` includes only metadata (method/path/flags), not handlers.

## API Surface (Draft)

### createHonoServer

```ts
const server = createHonoServer({
    name: 'MyApi',
    isDevelopment: process.env.NODE_ENV !== 'production',
    middlewares: [/* global middlewares */],
    routes: routesObjectOrArray,
    lifecycle: {
        beforeStart: async () => {},
        afterStart: ({app, server, logger}) => {},
        beforeStop: async () => {},
        afterStop: async () => {},
    },
    defaults: {
        trimTrailingSlash: true,
        requestTracking: true,
        requestLogger: true,
    },
    cors: { /* hono/cors options */},
    secureHeaders: { /* hono/secure-headers options */},
    auth: {
        enabled: true,
        authAll: false,
        // auth strategy config + onUnauthorized
    },
    responseValidation: {
        enabled: true,
    },
    errorHandler: customErrorHandler,
    notFoundHandler: customNotFoundHandler,
    logger: myLogger,
});
```

### route()

```ts
const getUser = route({
    method: 'get',
    path: '/users/:id',
    params: z.object({id: z.string()}),
    query: z.object({includePosts: z.boolean().optional()}).optional(),
    headers: z.object({'x-request-id': z.string().optional()}).optional(),
    body: z.object({}).optional(),
    response: z.object({id: z.string(), name: z.string()}).optional(),
    responseValidation: false,
    authorized: true,
    handler: async (c, input) => c.json({id: input.params.id, name: 'Ada'}),
});
```

Notes:
- `response` is optional; when provided, response validation runs (MVP).
- `input` aggregates `params`, `query`, `headers`, `body`.
- For non-API responses, handler can return `c.html(...)` or raw `Response`.
- `authorized` controls whether auth middleware is applied (see Auth Helpers).

### routesObject

```ts
const routes = {
    '/health': {
        get: route({
            response: z.object({status: z.literal('ok')}),
            handler: async (c) => c.json({status: 'ok'}),
        }),
    },
};
```

### routesArray

```ts
const routes = [
    route({
        method: 'get',
        path: '/health',
        response: z.object({status: z.literal('ok')}),
        handler: async (c) => c.json({status: 'ok'}),
    }),
];
```

## Proposed Features

### Core

- `createHonoServer` returns a wrapper class with:
    - `.app` (Hono instance)
    - `.start()` / `.stop()` that wraps `Bun.serve`
    - `.mount()` to register routes after instantiation
- Standard lifecycle hooks: `beforeStart`, `afterStart`, `beforeStop`, `afterStop` (accept a shared context object).
- Default error handler and not-found handler with consistent JSON shape, both overridable.
- `isDevelopment` flag to enable dev-only behaviors (e.g., response validation, warnings).

### Middleware Defaults

- Trim trailing slash middleware (default on, opt-out).
- Request tracking (correlation ID) and request logger (default on, opt-out).
- CORS and secure headers configured via options.
- Ability to disable any default middleware explicitly.

### Zod-First Validation

- Validate `params`, `query`, `headers`, and `body` via Zod.
- Provide a single, typed `input` object to handlers.
- Unified error format for validation errors.
- Response validation runs when a `response` schema is provided (MVP behavior).

### Auth Helpers

- Bearer token helper (header-based).
- Query token helper (dev/test).
- Composite auth helper that tries multiple strategies.
- Consistent `onUnauthorized` response shape.
- Auth defaults can be set globally and overridden per route with `authorized`.

### Routing Convenience

- Route builder function `route()` for consistent signatures.
- `routes` can be provided during `createHonoServer` and added later via `.mount()`.
- Internally normalize to `RoutesCollection` so routes can be mounted multiple times.

### Observability

- Default request logging (method, path, status, duration, requestId).
- Provide a minimal logger interface that normalizes method signatures; default shape is Pino-compatible.

### Security

- Default secure headers (sane CSP, COEP off) with overrides.
- CORS defaults to `origin: ['*']` if configured without options.

### API-first, HTML-allowed

- Defaults are tuned for JSON APIs.
- Raw Hono handlers are allowed for HTML or mixed content.

## Shared Response/Error Schema (Draft)

### Success response

```ts
{
    status: 'success',
    requestId: string,
    data: unknown | null,
}
```

### Error response

```ts
{
    status: 'error',
    requestId: string,
    errorType: 'validation' | 'auth' | 'not_found' | 'conflict' | 'rate_limit' | 'internal',
    errorCode?: string,
    errorMessage: string,
    validationErrors?: Array<{ path: string; message: string }>,
    errorStack?: string, // only in dev
}
```

### errorTypeFromStatus example

```ts
function errorTypeFromStatus(status: number) {
    if (status === 400) return 'validation';
    if (status === 401 || status === 403) return 'auth';
    if (status === 404) return 'not_found';
    if (status === 409) return 'conflict';
    if (status === 429) return 'rate_limit';
    return 'internal';
}
```

### errorCode union example

```ts
type ErrorCodeByType =
    | { errorType: 'validation'; errorCode: 'missing_field' | 'invalid_format' }
    | { errorType: 'auth'; errorCode: 'invalid_token' | 'expired_token' }
    | { errorType: 'not_found'; errorCode: 'resource_missing' }
    | { errorType: 'conflict'; errorCode: 'version_mismatch' }
    | { errorType: 'rate_limit'; errorCode: 'too_many_requests' }
    | { errorType: 'internal'; errorCode: 'unhandled_exception' };
```

### validationErrors path format example

```json
{
    "validationErrors": [
        { "path": "body.user.email", "message": "Invalid email" },
        { "path": "query.page", "message": "Expected number" },
        { "path": "params.id", "message": "Required" },
        { "path": "body.items[2].sku", "message": "Invalid SKU" }
    ]
}
```

## Behavior Notes

- If a route sets `authorized: true` but `auth.enabled` is false, throw at startup to catch misconfiguration.
- For `204`/`304`, omit the response body entirely (no envelope).
- For routes without a response schema, still enforce the success envelope for JSON responses.

## Clarification: When might a route lack a response schema?

Examples:
- HTML routes (they still respond, but you may not want a Zod schema).
- Streaming responses or file downloads.
- “Fire-and-forget” endpoints that return empty bodies (204) or rely on headers.
- Very simple endpoints where typing the response isn’t valuable yet.

We can keep requiring responses in the codebase by convention, but the library should allow omission for those cases.

## Answers to Your Questions

### 1) Do we really need response validation? Pros/cons + examples

**Pros**
- Catches contract regressions (e.g., handler returns wrong shape after refactor).
- Helps ensure a predictable error/response format for downstream clients.
- Useful in tests or staging to detect drift early.

**Cons**
- Runtime overhead on every response (cost scales with payload size).
- Redundant if handlers already build typed objects.
- Validation failures can be surprising in production if enabled globally.

**Examples where it helps**
- A handler accidentally returns `{userId: ...}` instead of `{id: ...}` after a refactor.
- A route’s response shape changes but the consuming app expects the old shape.
- A cache layer injects an unexpected `undefined` and silently breaks the response contract.

**Recommendation**
- Optional per-route and global toggle. Default on, with the ability to disable for perf.

### 2) What would the API for route() look like?

See the `route()` example above. The key design points:
- `method` and `path` can live in `route()` or be inferred from a routes object.
- Inputs are Zod schemas; the handler receives a typed `input` object.
- `authorized` is a per-route switch to apply auth.

### 3) If we wanted auto-generated OpenAPI, how would createHonoServer/route change?

- `route()` would carry extra metadata, e.g. `meta: { tags, summary, description, responses, security }`.
- `createHonoServer` would expose `.toOpenApi()` to return a spec.
- We’d add a Zod-to-OpenAPI converter to map schemas into OpenAPI types.
- Routes missing metadata would warn in `isDevelopment` mode or be marked incomplete in the spec.

### 4) createHonoServer should allow overriding error/not-found handlers

Yes, the wrapper should accept `errorHandler` and `notFoundHandler`, with defaults that return the shared schema.

### 5) API-first but allow HTML rendering

Yes. Defaults are JSON API oriented, but raw Hono handlers should be allowed so routes can return `c.html()` or `Response`.

### 6) Logger ergonomics: Pino vs console

Agree. A minimal logger interface is best:
- Provide a small interface with `info`, `warn`, `error`, `debug`.
- Default to Pino-style `(object, message)` and adapt console via a wrapper.

## Round 2 Questions + Answers

### Add isDevelopment to createHonoServer

Use it for dev-only behaviors (response validation, extra warnings, verbose errors).

### How to apply auth per route?

Add `authorized: boolean` on `route()`, and allow a global `auth.authAll` toggle in `createHonoServer`.

### Auto-generate an HTTP client from schemas?

Yes, the ingredients exist. Pros and cons:

**Pros**
- Strongly-typed client from the same schemas.
- Shared error schema = consistent error handling.

**Cons**
- Requires schema completeness and discipline.
- Hard to represent streaming/HTML routes.
- Might force response schemas everywhere.

## Suggested Plan

1. Finalize route API and response/error schema field names.
2. Decide auth defaults and logger interface.
3. Implement `createHonoServer` with defaults, hooks, and `.mount()`.
4. Implement Zod validation utilities (params/query/headers/body).
5. Implement auth helpers + `authorized` route switch.
6. Add tests for route validation, middleware defaults, and hooks.
7. Write README, llms.txt, and generate Typedoc docs.
8. Add changeset and publish.

## Discussion Notes

- Keep v0 small and opinionated; reuse lessons from `http-helper` but strip anything not essential to the wrapper.
- Single entry point `src/index.ts` that re-exports types and helpers.
- Wrapper class is preferred so users can call `.start()`.

## Proposed Package Structure

```
packages/hono-kit/
  docs/
    README.md
  llms.txt
  package.json
  README.md
  src/
    index.ts
    server/
      HonoServer.ts
      createHonoServer.ts
      RoutesCollection.ts
      types.ts
    routing/
      route.ts
      registerRoutes.ts
    middleware/
      defaults.ts
      requestTracking.ts
      requestLogger.ts
      trimTrailingSlash.ts
      cors.ts
      secureHeaders.ts
    validation/
      inputValidation.ts
      responseValidation.ts
      validationError.ts
    errors/
      errorTypes.ts
      errorEnvelope.ts
    auth/
      bearerAuth.ts
      queryAuth.ts
      compositeAuth.ts
      types.ts
    logging/
      logger.ts
      pinoAdapter.ts
      consoleAdapter.ts
    lifecycle/
      hooks.ts
  tests/
    unit/
      route.test.ts
      routesCollection.test.ts
      responseValidation.test.ts
      auth.test.ts
      errorEnvelope.test.ts
    integration/
      server.test.ts
```

### Key Classes / Modules

- `HonoServer`: wrapper class exposing `.app`, `.start()`, `.stop()`, `.mount()`.
- `RoutesCollection`: internal normalized route registry; exposed as readonly with `toJSON()` metadata.
- `route()`: route builder that carries schemas, auth flags, and handler.
- `registerRoutes`: wires `RoutesCollection` into the Hono instance.
- `validationError`: validation error class with `toJSON()`.
- `errorEnvelope`: helpers for success/error envelope formatting.
- `errorTypes`: `errorTypeFromStatus` and related type definitions.
- `logger`: minimal logger interface plus adapters.
- `middleware/defaults`: applies trim, tracking, cors, secure headers, request logging.
