[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / HttpServerStartOptions

# Type Alias: HttpServerStartOptions\<T\>

> **HttpServerStartOptions**\<`T`\> = `object`

Defined in: [packages/hono-kit/src/server/types.ts:114](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L114)

Options used when starting the server.

## Remarks

Specify hostname/port and optional lifecycle hooks and server factory.

## Example

```ts
const options: HttpServerStartOptions = { hostname: '0.0.0.0', port: 3000 };
```

## Type Parameters

### T

`T` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### hostname

> **hostname**: `NonNullable`\<`BunServeConfig`\[`"hostname"`\]\>

Defined in: [packages/hono-kit/src/server/types.ts:115](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L115)

***

### lifecycleHooks?

> `optional` **lifecycleHooks**: [`HttpServerLifecycleHooks`](HttpServerLifecycleHooks.md)\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:117](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L117)

***

### port

> **port**: `NonNullable`\<`BunServeConfig`\[`"port"`\]\>

Defined in: [packages/hono-kit/src/server/types.ts:116](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L116)

***

### serverFactory?

> `optional` **serverFactory**: `BunServe`

Defined in: [packages/hono-kit/src/server/types.ts:118](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L118)
