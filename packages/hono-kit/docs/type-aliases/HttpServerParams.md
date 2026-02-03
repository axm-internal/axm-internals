[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / HttpServerParams

# Type Alias: HttpServerParams\<T\>

> **HttpServerParams**\<`T`\> = `object`

Defined in: [packages/hono-kit/src/server/types.ts:146](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L146)

Parameters for constructing a raw Hono server wrapper.

## Remarks

Used internally for server composition and dependency injection.

## Example

```ts
const params: HttpServerParams = { name: 'api', routes: new Hono() };
```

## Type Parameters

### T

`T` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### errorHandler?

> `optional` **errorHandler**: `ErrorHandler`

Defined in: [packages/hono-kit/src/server/types.ts:152](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L152)

***

### honoApp?

> `optional` **honoApp**: `Hono`\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:150](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L150)

***

### lifecycleHooks?

> `optional` **lifecycleHooks**: [`HttpServerLifecycleHooks`](HttpServerLifecycleHooks.md)\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:155](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L155)

***

### logger?

> `optional` **logger**: `Logger`

Defined in: [packages/hono-kit/src/server/types.ts:151](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L151)

***

### middlewareCollection?

> `optional` **middlewareCollection**: `MiddlewareHandler`[]

Defined in: [packages/hono-kit/src/server/types.ts:154](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L154)

***

### name

> **name**: `string`

Defined in: [packages/hono-kit/src/server/types.ts:147](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L147)

***

### notFoundHandler?

> `optional` **notFoundHandler**: `NotFoundHandler`\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:153](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L153)

***

### routePrefix?

> `optional` **routePrefix**: `string`

Defined in: [packages/hono-kit/src/server/types.ts:149](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L149)

***

### routes

> **routes**: `Hono`\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:148](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L148)
