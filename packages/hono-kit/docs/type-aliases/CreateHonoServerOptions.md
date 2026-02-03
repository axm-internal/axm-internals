[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / CreateHonoServerOptions

# Type Alias: CreateHonoServerOptions\<T\>

> **CreateHonoServerOptions**\<`T`\> = `object`

Defined in: [packages/hono-kit/src/server/types.ts:218](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L218)

Options for creating a `HonoServer`.

## Remarks

Includes route registration, defaults, and middleware configuration.

## Example

```ts
const options: CreateHonoServerOptions = { name: 'api', routes };
```

## Type Parameters

### T

`T` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### auth?

> `optional` **auth**: [`AuthConfig`](AuthConfig.md)\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:228](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L228)

***

### cors?

> `optional` **cors**: [`CorsOptions`](CorsOptions.md)

Defined in: [packages/hono-kit/src/server/types.ts:226](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L226)

***

### defaults?

> `optional` **defaults**: [`DefaultMiddlewareOptions`](DefaultMiddlewareOptions.md)

Defined in: [packages/hono-kit/src/server/types.ts:225](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L225)

***

### errorHandler?

> `optional` **errorHandler**: `ErrorHandler`

Defined in: [packages/hono-kit/src/server/types.ts:229](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L229)

***

### honoApp?

> `optional` **honoApp**: `Hono`\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:232](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L232)

***

### isDevelopment?

> `optional` **isDevelopment**: `boolean`

Defined in: [packages/hono-kit/src/server/types.ts:220](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L220)

***

### lifecycleHooks?

> `optional` **lifecycleHooks**: [`HttpServerLifecycleHooks`](HttpServerLifecycleHooks.md)\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:231](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L231)

***

### logger?

> `optional` **logger**: `Logger`

Defined in: [packages/hono-kit/src/server/types.ts:223](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L223)

***

### middlewares?

> `optional` **middlewares**: `MiddlewareHandler`\<`T`\>[]

Defined in: [packages/hono-kit/src/server/types.ts:224](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L224)

***

### name

> **name**: `string`

Defined in: [packages/hono-kit/src/server/types.ts:219](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L219)

***

### notFoundHandler?

> `optional` **notFoundHandler**: `NotFoundHandler`\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:230](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L230)

***

### routePrefix?

> `optional` **routePrefix**: `string`

Defined in: [packages/hono-kit/src/server/types.ts:222](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L222)

***

### routes?

> `optional` **routes**: [`RoutesInput`](RoutesInput.md)

Defined in: [packages/hono-kit/src/server/types.ts:221](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L221)

***

### secureHeaders?

> `optional` **secureHeaders**: [`SecureHeadersOptions`](SecureHeadersOptions.md)

Defined in: [packages/hono-kit/src/server/types.ts:227](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L227)
