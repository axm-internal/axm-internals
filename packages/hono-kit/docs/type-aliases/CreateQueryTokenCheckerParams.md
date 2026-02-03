[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / CreateQueryTokenCheckerParams

# Type Alias: CreateQueryTokenCheckerParams\<TEnv\>

> **CreateQueryTokenCheckerParams**\<`TEnv`\> = `object`

Defined in: [packages/hono-kit/src/auth/types.ts:91](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L91)

Parameters for building a query-token checker middleware.

## Remarks

The token will be read from the query string using the configured key.

## Example

```ts
const params: CreateQueryTokenCheckerParams = {
  service: { verifyToken: async () => true },
  options: { paramKey: 'api-key' },
};
```

## Type Parameters

### TEnv

`TEnv` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### onUnauthorized?

> `optional` **onUnauthorized**: [`UnauthorizedHandler`](UnauthorizedHandler.md)\<`TEnv`\>

Defined in: [packages/hono-kit/src/auth/types.ts:94](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L94)

***

### options?

> `optional` **options**: [`QueryAuthOptions`](QueryAuthOptions.md)

Defined in: [packages/hono-kit/src/auth/types.ts:93](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L93)

***

### service

> **service**: [`TokenVerifier`](TokenVerifier.md)\<`TEnv`\>

Defined in: [packages/hono-kit/src/auth/types.ts:92](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L92)
