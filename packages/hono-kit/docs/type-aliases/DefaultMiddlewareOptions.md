[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / DefaultMiddlewareOptions

# Type Alias: DefaultMiddlewareOptions

> **DefaultMiddlewareOptions** = `object`

Defined in: [packages/hono-kit/src/middleware/defaults.ts:25](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/defaults.ts#L25)

Flags and options for the default middleware set.

## Remarks

Each flag can be disabled or configured with specific options.

## Example

```ts
const options: DefaultMiddlewareOptions = {
  cors: { origin: '*' },
  secureHeaders: true,
};
```

## Properties

### cors?

> `optional` **cors**: `boolean` \| [`CorsOptions`](CorsOptions.md)

Defined in: [packages/hono-kit/src/middleware/defaults.ts:29](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/defaults.ts#L29)

***

### requestLogger?

> `optional` **requestLogger**: `boolean`

Defined in: [packages/hono-kit/src/middleware/defaults.ts:28](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/defaults.ts#L28)

***

### requestTracking?

> `optional` **requestTracking**: `boolean`

Defined in: [packages/hono-kit/src/middleware/defaults.ts:27](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/defaults.ts#L27)

***

### secureHeaders?

> `optional` **secureHeaders**: `boolean` \| [`SecureHeadersOptions`](SecureHeadersOptions.md)

Defined in: [packages/hono-kit/src/middleware/defaults.ts:30](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/defaults.ts#L30)

***

### trimTrailingSlash?

> `optional` **trimTrailingSlash**: `boolean`

Defined in: [packages/hono-kit/src/middleware/defaults.ts:26](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/defaults.ts#L26)
