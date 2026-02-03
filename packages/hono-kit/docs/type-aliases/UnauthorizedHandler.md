[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / UnauthorizedHandler

# Type Alias: UnauthorizedHandler()\<TEnv\>

> **UnauthorizedHandler**\<`TEnv`\> = (`c`) => `Response` \| `Promise`\<`Response`\>

Defined in: [packages/hono-kit/src/auth/types.ts:58](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L58)

Produces a response when authentication fails.

## Type Parameters

### TEnv

`TEnv` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Parameters

### c

`Context`\<`TEnv`\>

## Returns

`Response` \| `Promise`\<`Response`\>

## Remarks

This allows custom error payloads or redirects for unauthorized requests.

## Example

```ts
const onUnauthorized: UnauthorizedHandler = (c) => c.text('Unauthorized', 401);
```
