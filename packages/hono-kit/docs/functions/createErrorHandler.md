[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createErrorHandler

# Function: createErrorHandler()

> **createErrorHandler**\<`T`\>(): `ErrorHandler`\<`T`\>

Defined in: [packages/hono-kit/src/errors/errorHandler.ts:53](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/errorHandler.ts#L53)

Create a standardized Hono error handler.

## Type Parameters

### T

`T` *extends* [`AppEnv`](../type-aliases/AppEnv.md) = [`AppEnv`](../type-aliases/AppEnv.md)

## Returns

`ErrorHandler`\<`T`\>

An error handler that returns JSON error envelopes.

## Remarks

Includes request IDs and stacks only when in development mode.

## Example

```ts
app.onError(createErrorHandler());
```
