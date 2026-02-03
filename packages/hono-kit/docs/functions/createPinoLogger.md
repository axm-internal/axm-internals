[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createPinoLogger

# Function: createPinoLogger()

> **createPinoLogger**(`options`): `Logger`

Defined in: [packages/hono-kit/src/logging/pinoAdapter.ts:33](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/logging/pinoAdapter.ts#L33)

Create a Pino logger with optional bindings.

## Parameters

### options

[`CreatePinoLoggerOptions`](../type-aliases/CreatePinoLoggerOptions.md) = `{}`

Logger base instance and bindings.

## Returns

`Logger`

A Pino logger (either the base logger or a child logger).

## Remarks

Throws when `baseLogger` is not provided.

## Example

```ts
const logger = createPinoLogger({ baseLogger, bindings: { requestId } });
```
