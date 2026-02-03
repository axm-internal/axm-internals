[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createDefaultMiddlewares

# Function: createDefaultMiddlewares()

> **createDefaultMiddlewares**(`options`, `context`): `MiddlewareHandler`[]

Defined in: [packages/hono-kit/src/middleware/defaults.ts:60](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/defaults.ts#L60)

Build the default middleware chain for a server.

## Parameters

### options

[`DefaultMiddlewareOptions`](../type-aliases/DefaultMiddlewareOptions.md) = `{}`

Feature flags and middleware-specific options.

### context

[`DefaultMiddlewareContext`](../type-aliases/DefaultMiddlewareContext.md) = `{}`

External dependencies such as logging.

## Returns

`MiddlewareHandler`[]

A list of middleware handlers.

## Remarks

Middleware are returned in a stable order to ensure consistent behavior.

## Example

```ts
const middlewares = createDefaultMiddlewares({ requestLogger: true }, { logger });
```
