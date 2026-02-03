[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createCompositeTokenAuth

# Function: createCompositeTokenAuth()

> **createCompositeTokenAuth**\<`TEnv`\>(`params`): `MiddlewareHandler`\<`TEnv`\>

Defined in: [packages/hono-kit/src/auth/compositeAuth.ts:33](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/compositeAuth.ts#L33)

Compose multiple auth middlewares and fall back until one succeeds.

## Type Parameters

### TEnv

`TEnv` *extends* [`AppEnv`](../type-aliases/AppEnv.md) = [`AppEnv`](../type-aliases/AppEnv.md)

## Parameters

### params

[`CreateCompositeTokenAuthParams`](../type-aliases/CreateCompositeTokenAuthParams.md)\<`TEnv`\>

Middleware list and unauthorized handler options.

## Returns

`MiddlewareHandler`\<`TEnv`\>

A middleware that runs each auth strategy in order.

## Remarks

Any middleware that calls `next` or returns a response is treated as the winning auth strategy.

## Example

```ts
const auth = createCompositeTokenAuth({
  middlewares: [bearerAuthMiddleware, queryAuthMiddleware],
});
```
