[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createTrimTrailingSlash

# Function: createTrimTrailingSlash()

> **createTrimTrailingSlash**(): `MiddlewareHandler`

Defined in: [packages/hono-kit/src/middleware/trimTrailingSlash.ts:15](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/trimTrailingSlash.ts#L15)

Create middleware that normalizes trailing slashes.

## Returns

`MiddlewareHandler`

A middleware handler that trims trailing slashes from URLs.

## Remarks

Delegates to `hono/trailing-slash` for implementation.

## Example

```ts
app.use('*', createTrimTrailingSlash());
```
