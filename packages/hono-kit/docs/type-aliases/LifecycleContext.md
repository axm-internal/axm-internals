[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / LifecycleContext

# Type Alias: LifecycleContext\<T\>

> **LifecycleContext**\<`T`\> = `object`

Defined in: [packages/hono-kit/src/server/types.ts:79](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L79)

Context passed to lifecycle hooks.

## Remarks

Provides access to the app, server, and optional logger.

## Example

```ts
const hooks: HttpServerLifecycleHooks = {
  afterStart: ({ server }) => console.log(server),
};
```

## Type Parameters

### T

`T` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### app

> **app**: `Hono`\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:80](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L80)

***

### logger?

> `optional` **logger**: `Logger`

Defined in: [packages/hono-kit/src/server/types.ts:82](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L82)

***

### server

> **server**: [`BunServer`](BunServer.md)

Defined in: [packages/hono-kit/src/server/types.ts:81](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L81)
