[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createRequestTracking

# Function: createRequestTracking()

> **createRequestTracking**(): `MiddlewareHandler`\<[`AppEnv`](../type-aliases/AppEnv.md)\>

Defined in: [packages/hono-kit/src/middleware/requestTracking.ts:76](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/requestTracking.ts#L76)

Create middleware that ensures a request ID and start time are set.

## Returns

`MiddlewareHandler`\<[`AppEnv`](../type-aliases/AppEnv.md)\>

A middleware handler that tracks request IDs and timing.

## Remarks

This sets `requestId` and `requestStartTime` on the Hono context.

## Example

```ts
app.use('*', createRequestTracking());
```
