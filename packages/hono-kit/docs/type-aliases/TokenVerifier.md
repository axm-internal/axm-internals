[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / TokenVerifier

# Type Alias: TokenVerifier\<TEnv\>

> **TokenVerifier**\<`TEnv`\> = `object`

Defined in: [packages/hono-kit/src/auth/types.ts:44](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L44)

Verifies whether a token is valid for the current request.

## Remarks

Implementations can be synchronous or async.

## Example

```ts
const verifier: TokenVerifier = {
  verifyToken: (token) => token === 'secret',
};
```

## Type Parameters

### TEnv

`TEnv` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### verifyToken()

> **verifyToken**: (`token`, `c`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [packages/hono-kit/src/auth/types.ts:45](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L45)

#### Parameters

##### token

`string`

##### c

`Context`\<`TEnv`\>

#### Returns

`boolean` \| `Promise`\<`boolean`\>
