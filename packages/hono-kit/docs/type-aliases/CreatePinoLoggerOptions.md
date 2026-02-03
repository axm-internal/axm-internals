[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / CreatePinoLoggerOptions

# Type Alias: CreatePinoLoggerOptions

> **CreatePinoLoggerOptions** = `object`

Defined in: [packages/hono-kit/src/logging/pinoAdapter.ts:16](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/logging/pinoAdapter.ts#L16)

Options for building a logger from a base Pino instance.

## Remarks

Bindings are added via `logger.child()` when provided.

## Example

```ts
const options: CreatePinoLoggerOptions = {
  baseLogger,
  bindings: { service: 'api' },
};
```

## Properties

### baseLogger?

> `optional` **baseLogger**: `Logger`

Defined in: [packages/hono-kit/src/logging/pinoAdapter.ts:17](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/logging/pinoAdapter.ts#L17)

***

### bindings?

> `optional` **bindings**: `Record`\<`string`, `unknown`\>

Defined in: [packages/hono-kit/src/logging/pinoAdapter.ts:18](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/logging/pinoAdapter.ts#L18)
