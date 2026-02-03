[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RequestLoggerOptions

# Type Alias: RequestLoggerOptions

> **RequestLoggerOptions** = `object`

Defined in: [packages/hono-kit/src/middleware/requestLogger.ts:17](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/requestLogger.ts#L17)

Options for request logging middleware.

## Remarks

The message is used as the log line message in Pino.

## Example

```ts
const options: RequestLoggerOptions = { logger, message: 'http' };
```

## Properties

### logger

> **logger**: `Logger`

Defined in: [packages/hono-kit/src/middleware/requestLogger.ts:18](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/requestLogger.ts#L18)

***

### message?

> `optional` **message**: `string`

Defined in: [packages/hono-kit/src/middleware/requestLogger.ts:19](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/requestLogger.ts#L19)
