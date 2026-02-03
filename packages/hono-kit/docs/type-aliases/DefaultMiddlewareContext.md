[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / DefaultMiddlewareContext

# Type Alias: DefaultMiddlewareContext

> **DefaultMiddlewareContext** = `object`

Defined in: [packages/hono-kit/src/middleware/defaults.ts:43](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/defaults.ts#L43)

Context required by default middlewares.

## Remarks

Provide a logger to enable request logging.

## Example

```ts
const context: DefaultMiddlewareContext = { logger };
```

## Properties

### logger?

> `optional` **logger**: `Logger`

Defined in: [packages/hono-kit/src/middleware/defaults.ts:44](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/defaults.ts#L44)
