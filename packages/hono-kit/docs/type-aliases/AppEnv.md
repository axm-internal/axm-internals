[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / AppEnv

# Type Alias: AppEnv

> **AppEnv** = `object`

Defined in: [packages/hono-kit/src/server/types.ts:59](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L59)

Environment variables used by the Hono server context.

## Remarks

Includes request metadata stored on the Hono context.

## Example

```ts
const env: AppEnv = { Variables: { requestId: 'req_123' } };
```

## Properties

### Variables

> **Variables**: `object`

Defined in: [packages/hono-kit/src/server/types.ts:60](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L60)

#### isDevelopment?

> `optional` **isDevelopment**: `boolean`

#### requestId

> **requestId**: `string`

#### requestStartTime?

> `optional` **requestStartTime**: `number`
