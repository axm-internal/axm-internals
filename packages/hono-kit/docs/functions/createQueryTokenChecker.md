[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createQueryTokenChecker

# Function: createQueryTokenChecker()

> **createQueryTokenChecker**\<`TEnv`\>(`params`): `MiddlewareHandler`\<`TEnv`\>

Defined in: [packages/hono-kit/src/auth/queryAuth.ts:31](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/queryAuth.ts#L31)

Create a query-parameter token authentication middleware.

## Type Parameters

### TEnv

`TEnv` *extends* [`AppEnv`](../type-aliases/AppEnv.md) = [`AppEnv`](../type-aliases/AppEnv.md)

## Parameters

### params

[`CreateQueryTokenCheckerParams`](../type-aliases/CreateQueryTokenCheckerParams.md)\<`TEnv`\>

Configuration for verifying tokens and handling unauthorized responses.

## Returns

`MiddlewareHandler`\<`TEnv`\>

A Hono middleware that enforces query token authentication.

## Remarks

Reads the token from the configured query parameter and delegates verification to the service.

## Example

```ts
const auth = createQueryTokenChecker({
  service: { verifyToken: async (token) => token.startsWith('key_') },
  options: { paramKey: 'api-key' },
});
```
