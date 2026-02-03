[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createCors

# Function: createCors()

> **createCors**(`options?`): `MiddlewareHandler`

Defined in: [packages/hono-kit/src/middleware/cors.ts:28](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/cors.ts#L28)

Create a CORS middleware instance.

## Parameters

### options?

`CORSOptions`

CORS configuration options.

## Returns

`MiddlewareHandler`

A Hono middleware that applies CORS headers.

## Remarks

Delegates to `hono/cors` for implementation.

## Example

```ts
const corsMiddleware = createCors({ origin: '*' });
```
