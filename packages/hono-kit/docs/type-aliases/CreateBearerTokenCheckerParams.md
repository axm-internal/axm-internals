[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / CreateBearerTokenCheckerParams

# Type Alias: CreateBearerTokenCheckerParams\<TEnv\>

> **CreateBearerTokenCheckerParams**\<`TEnv`\> = `object`

Defined in: [packages/hono-kit/src/auth/types.ts:72](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L72)

Parameters for building a bearer-token checker middleware.

## Remarks

Provide a token verifier and optional unauthorized handler.

## Example

```ts
const params: CreateBearerTokenCheckerParams = {
  service: { verifyToken: (token) => token === 'secret' },
};
```

## Type Parameters

### TEnv

`TEnv` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### onUnauthorized?

> `optional` **onUnauthorized**: [`UnauthorizedHandler`](UnauthorizedHandler.md)\<`TEnv`\>

Defined in: [packages/hono-kit/src/auth/types.ts:75](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L75)

***

### options?

> `optional` **options**: `Omit`\<[`BearerAuthOptions`](BearerAuthOptions.md), `"token"` \| `"verifyToken"`\>

Defined in: [packages/hono-kit/src/auth/types.ts:74](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L74)

***

### service

> **service**: [`TokenVerifier`](TokenVerifier.md)\<`TEnv`\>

Defined in: [packages/hono-kit/src/auth/types.ts:73](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L73)
