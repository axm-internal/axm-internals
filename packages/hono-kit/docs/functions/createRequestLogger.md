[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createRequestLogger

# Function: createRequestLogger()

> **createRequestLogger**(`options`): `MiddlewareHandler`\<[`AppEnv`](../type-aliases/AppEnv.md)\>

Defined in: [packages/hono-kit/src/middleware/requestLogger.ts:35](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/requestLogger.ts#L35)

Create middleware that logs requests after completion.

## Parameters

### options

[`RequestLoggerOptions`](../type-aliases/RequestLoggerOptions.md)

Logger and message configuration.

## Returns

`MiddlewareHandler`\<[`AppEnv`](../type-aliases/AppEnv.md)\>

A middleware handler that logs request metrics.

## Remarks

Reads request timing data set by request tracking middleware when available.

## Example

```ts
const requestLogger = createRequestLogger({ logger });
```
