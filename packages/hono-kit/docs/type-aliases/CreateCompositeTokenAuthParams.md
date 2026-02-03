[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / CreateCompositeTokenAuthParams

# Type Alias: CreateCompositeTokenAuthParams\<TEnv\>

> **CreateCompositeTokenAuthParams**\<`TEnv`\> = `object`

Defined in: [packages/hono-kit/src/auth/types.ts:109](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L109)

Parameters for composing multiple auth middlewares.

## Remarks

Middlewares run in order until one authenticates or returns a response.

## Example

```ts
const params: CreateCompositeTokenAuthParams = {
  middlewares: [bearerAuthMiddleware, queryAuthMiddleware],
};
```

## Type Parameters

### TEnv

`TEnv` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### middlewares

> **middlewares**: `MiddlewareHandler`\<`TEnv`\>[]

Defined in: [packages/hono-kit/src/auth/types.ts:110](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L110)

***

### onUnauthorized?

> `optional` **onUnauthorized**: [`UnauthorizedHandler`](UnauthorizedHandler.md)\<`TEnv`\>

Defined in: [packages/hono-kit/src/auth/types.ts:111](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L111)
