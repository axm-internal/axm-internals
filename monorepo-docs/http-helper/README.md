# @repo/http-helper

Utilities for composing Hono-based HTTP servers with consistent middleware defaults across the monorepo.

## HttpApp

`HttpApp` wraps a Hono instance and exposes helper methods for wiring common middleware in a fluent style.

### Basic Usage

```ts
import { HttpApp } from '@repo/http-helper';
import { appRoutes } from './routes';

const httpServer = new HttpApp({
    name: 'PriceLaceApi',
    routes: appRoutes,
    lifecycleHooks: {
        beforeStart: async () => {
            await initializeDatabase();
        },
        afterStop: async () => {
            await closeDatabase();
        },
    },
})
    .addTrimTrailingSlash()
    .addRequestTracking()
    .addCors()
    .addSecureHeaders()
    .addRequestLogger();

export const honoApp = httpServer.init();

const { stop } = await httpServer.start({
    hostname: '0.0.0.0',
    port: 3000,
});
```

### Default Middleware Bundle

When you want the standard stack (trim trailing slashes, request tracking, CORS, secure headers, and request logging) in one shot, call `withDefaultMiddleware`:

```ts
const httpServer = new HttpApp({
    name: 'PriceLaceApi',
    routes: appRoutes,
}).withDefaultMiddleware({
    corsOptions: { origin: ['https://example.com'] },
    secureHeadersOptions: {
        contentSecurityPolicy: {
            defaultSrc: ["'self'"],
        },
        crossOriginEmbedderPolicy: false,
    },
});
```

This method is idempotent—calling it multiple times will not append duplicate middleware.

### Server Lifecycle & Hooks

`startServer` (and its alias `start`) wraps `Bun.serve()` and exposes lifecycle hooks so you can plug in initialization or teardown logic. Provide hooks during construction for the driest setup, or override them at start time when necessary:

```ts
const httpApp = new HttpApp({
    name: 'PriceLaceApi',
    routes: appRoutes,
    lifecycleHooks: {
        beforeStart: async () => {
            await initializeDatabase();
        },
        afterStop: async () => {
            await closeDatabase();
        },
    },
});

const { stop } = await httpApp.start({
    hostname: '0.0.0.0',
    port: 3000,
});

// Need a one-off override? Provide lifecycleHooks when calling start/startServer.
await httpApp.startServer({
    hostname: '0.0.0.0',
    port: 3000,
    lifecycleHooks: {
        afterStart: ({ server }) => logger.info({ port: server.port }, 'server ready'),
    },
});

process.on('SIGTERM', () => stop('SIGTERM'));
```

Hooks are all optional and run in order: `beforeStart` → `afterStart` → `beforeStop` → `afterStop`.

### Exported Types & Defaults

All option types are exported from `@repo/http-helper` so downstream packages can reuse them without importing from internals:

- `HttpAppParams` – constructor arguments, including optional `errorHandler`, `notFoundHandler`, extra middleware, and `lifecycleHooks`.
- `CORSOptions` – fed into `addCors`; defaults to `{ origin: ['*'] }` when omitted.
- `SecureHeadersOptions` – passed to `addSecureHeaders`; defaults to a CSP of `default-src 'self'` with `crossOriginEmbedderPolicy` disabled.
- `HttpServerLifecycleHooks`, `HttpServerStartOptions`, `HttpServerStartResult`, and `BunServer` utilities – power `startServer` and its lifecycle hooks.
- `TokenVerifier`, `CreateBearerTokenCheckerParams`, `CreateQueryTokenCheckerParams`, and `CreateCompositeTokenAuthParams` – power the API-token helpers described below.
- `PaginationParserOptions` / `PaginationParserResult` – configure the shared pagination parser for query validation.
- `LastEditedValidatorOptions` / `LastEditedSource` – configure the last-edited caching middleware outlined below.

Because these are exported types, you can share them across apps (e.g., `apps/api-server`) to keep configuration strongly typed.

### API Token Auth Helper

If your routes share the same API-token verification flow, use `createBearerTokenChecker` to wire up `hono/bearer-auth` with a reusable service:

```ts
import { createBearerTokenChecker } from '@repo/http-helper';
import { VerifyApiTokenService } from './auth/VerifyApiTokenService';

const apiTokenAuth = createBearerTokenChecker({
    service: new VerifyApiTokenService(),
    headerName: 'x-api-token', // optional overrides from hono/bearer-auth config
});

// Requests must still send the expected prefix, e.g. 'Bearer <token>' unless you override `prefix`.

honoApp.use('/secure/*', apiTokenAuth);
```

Your service implements `TokenVerifier`, receives the typed `Context`, and returns `true` when the token is valid. Use `CreateBearerTokenCheckerParams` if you need the fully typed options bag from `hono/bearer-auth`.

Need tokens in query params too? Pair `createQueryTokenChecker` with the composite helper. The checker looks for a token in the supplied `paramKey` (defaults to `api-key`) and only calls `next()` when that token is valid.

When you need multiple token sources (e.g., allow `Authorization` headers and a `?api-key=` query param in development), pass an array of middlewares to `createCompositeTokenAuth`. Each middleware decides how to locate/verify a token and should call the provided `next()` only when auth succeeds:

```ts
import { createBearerTokenChecker, createCompositeTokenAuth, createQueryTokenChecker } from '@repo/http-helper';

const service = new VerifyApiTokenService();

const apiAuth = createCompositeTokenAuth({
    middlewares: [
        createQueryTokenChecker({ service }), // dev/test convenience
        createBearerTokenChecker({ service }), // default Authorization: Bearer <token>
    ],
});

honoApp.use('/secure/*', apiAuth);
```

The composite helper runs each middleware in order until one calls `next()`. It automatically ignores `HTTPException` instances with `400`/`401` status codes so later middlewares can try. Provide a custom `onUnauthorized` callback if you want a JSON body instead of the default `401 Unauthorized`.

### Available Helpers

- `addTrimTrailingSlash()`
- `addRequestTracking()` – registers tracking only once, even if called multiple times.
- `addCors(options?: CORSOptions)` – defaults to `{ origin: ['*'] }` when no options are provided.
- `addSecureHeaders(options?: SecureHeadersOptions)` – defaults to a strict CSP plus disabled COEP when omitted.
- `addRequestLogger()` – automatically ensures request tracking runs first so every log includes `requestId` and duration metadata.
- `withDefaultMiddleware()` – applies the standard bundle described above.
- `createLastEditedValidator()` – data-aware caching middleware that emits deterministic `ETag`/`Last-Modified` headers for GET routes.
- `ReadQueryParams` – helpers such as `readString`, `readBoolean`, `readNumber`, and `readInt` that trim inputs, fall back to defaults, and return typed values so route filters stay predictable.
- `createPaginationOptionsBuilder(config)` – pairs with the shared pagination configs to turn a `HonoRequest` into a ready-to-use `PaginationOptions` object (page, limit, order, and `where` filters).

### Error and Not Found Handlers

Pass `errorHandler` and `notFoundHandler` when constructing `HttpApp` to customize both behaviors:

```ts
const httpServer = new HttpApp({
    name: 'PriceLaceApi',
    routes: appRoutes,
    errorHandler: customErrorHandler,
    notFoundHandler: (c) => c.text('Not Found', 404),
});
```
### Pagination Helpers

`createPaginationOptionsBuilder` combines the shared pagination configs (sortable + queryable field descriptors) with a `HonoRequest`, so routes get a ready-to-use `PaginationOptions` object:

```ts
import { SneakerPaginationConfig } from '@repo/app-shared-types';
import { createPaginationOptionsBuilder } from '@repo/http-helper';

const buildSneakerPagination = createPaginationOptionsBuilder<SneakerEntity>(SneakerPaginationConfig);

sneakerRoutes.get('/', async (c) => {
    const paginationOptions = buildSneakerPagination(c.req);
    const results = await sneakersRepo.findPaginated({
        ...paginationOptions,
        relations: {
            model: { brand: true },
            colorway: true,
        },
    });

    return c.json(results);
});
```

Configs describe:

- Limits + defaults (`minLimit`, `maxLimit`, `defaultLimit`, `defaultPage`).
- Sortable fields (`sortableFields.fields`) and the default column/direction.
- Queryable fields (`queryableFields`) — each entry defines a query param name, target path for `where` (supporting nested relations like `['model', 'brand', 'slug']`), a value type (`string`, `int`, `number`, `boolean`), optional Zod schema for enums, and an optional default. When a field declares `defaultValue`, that value is injected even if the client omits the param (e.g., Sneaker DB listings always filter to `parsed: true`).

Under the hood the builder uses the lower-level parser (below) plus the `ReadQueryParams` utilities so every listing endpoint clamps pagination inputs, validates order-by fields, and emits predictable `where` objects for TypeORM.

`createPaginationParser` is still exported if you only need the normalized primitives (page, limit, orderBy, orderDir, plus any configured boolean flags) without generating a repository-ready options object. Pass the same `PaginationConfig` you’d feed to the options builder: `const parse = createPaginationParser({ config: SneakerPaginationConfig })`. The parser enforces the config’s bounds, allowed fields, and order directions, and you can keep using the optional `booleanParams` map for bespoke flag parsing.

### Last Edited Cache Validator

Use `createLastEditedValidator` when you want conditional GET handling (`If-None-Match`/`If-Modified-Since`) that is aware of the underlying repositories powering a route:

```ts
import { createLastEditedValidator } from '@repo/http-helper';
import { SneakerDbRecordsRepository } from '@repo/app-modules';

const lastEdited = createLastEditedValidator({
    sources: [{ repo: sneakerDbRecordsRepository }],
    memoizeMs: 1_000, // collapse bursts of requests into one repo lookup
    logger, // optional pino logger for debug traces
});

sneakerDbRoutes.use(lastEdited);
sneakerDbRoutes.get('/', handler);
```

Key details:

- Only `GET` requests are processed (set `includeHead: true` for HEAD support). Other methods bypass the middleware entirely.
- The middleware calls `repo.getLastModifiedAt()` on each source, picks the most recent timestamp, and memoizes it in-memory for `memoizeMs` milliseconds so you don’t pound the DB on every request.
- Query parameters are normalized and hashed (via `object-hash`), so `/records?brand=nike&page=2` and `/records?page=2&brand=nike` share the same weak `ETag`, while `/records?page=3` has a distinct validator even if the data timestamp hasn’t advanced.
- When the client sends `If-None-Match` or `If-Modified-Since` headers that match the repo timestamp, the middleware returns `304 Not Modified` before your handler runs. Otherwise it stamps `ETag`, `Last-Modified`, and an optional `Cache-Control` header (default `private, max-age=0, must-revalidate`) on the downstream response.
- Pass a `logger` (anything with a `debug` method, such as a Pino child logger) to surface detailed traces about the computed timestamps. You can also set `DEBUG_LAST_EDITED=true` in your environment to have both the middleware **and** the underlying repositories emit console debug logs showing how the last-modified dates were calculated (e.g., whether `updatedAt` or `createdAt`/`id` fallback was used).
- Conditional comparisons follow HTTP semantics by truncating timestamps to whole seconds (matching the precision of HTTP-date headers), so a client can safely replay the exact `Last-Modified` value it received and get a `304` when nothing has changed.
