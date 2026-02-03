[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createBearerTokenChecker

# Function: createBearerTokenChecker()

> **createBearerTokenChecker**\<`TEnv`\>(`params`): `MiddlewareHandler`\<`TEnv`\>

Defined in: [packages/hono-kit/src/auth/bearerAuth.ts:22](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/bearerAuth.ts#L22)

Create a bearer-token authentication middleware.

## Type Parameters

### TEnv

`TEnv` *extends* [`AppEnv`](../type-aliases/AppEnv.md) = [`AppEnv`](../type-aliases/AppEnv.md)

## Parameters

### params

[`CreateBearerTokenCheckerParams`](../type-aliases/CreateBearerTokenCheckerParams.md)\<`TEnv`\>

Configuration for verifying bearer tokens and handling unauthorized responses.

## Returns

`MiddlewareHandler`\<`TEnv`\>

A Hono middleware that enforces bearer authentication.

## Remarks

Uses `hono/bearer-auth` under the hood and delegates token verification to the provided service.

## Example

```ts
const middleware = createBearerTokenChecker({
  service: { verifyToken: (token) => token === 'secret' },
});
```
