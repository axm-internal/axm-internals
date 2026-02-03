[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / AuthConfig

# Type Alias: AuthConfig\<T\>

> **AuthConfig**\<`T`\> = `object`

Defined in: [packages/hono-kit/src/server/types.ts:202](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L202)

Authentication configuration for the server.

## Remarks

Enable auth and provide middleware to enforce it.

## Example

```ts
const auth: AuthConfig = { enabled: true, middleware: authMiddleware };
```

## Type Parameters

### T

`T` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### authAll?

> `optional` **authAll**: `boolean`

Defined in: [packages/hono-kit/src/server/types.ts:204](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L204)

***

### enabled

> **enabled**: `boolean`

Defined in: [packages/hono-kit/src/server/types.ts:203](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L203)

***

### middleware?

> `optional` **middleware**: `MiddlewareHandler`\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:205](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L205)
