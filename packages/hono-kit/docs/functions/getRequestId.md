[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / getRequestId

# Function: getRequestId()

> **getRequestId**\<`T`\>(`c`): `string`

Defined in: [packages/hono-kit/src/server/getRequestId.ts:17](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/getRequestId.ts#L17)

Read the request ID from the Hono context.

## Type Parameters

### T

`T` *extends* [`AppEnv`](../type-aliases/AppEnv.md)

## Parameters

### c

`Context`\<`T`\>

Hono context.

## Returns

`string`

The request ID or `unknown` when missing.

## Remarks

This assumes request tracking middleware has set `requestId`.

## Example

```ts
const requestId = getRequestId(c);
```
