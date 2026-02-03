[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / SuccessEnvelope

# Type Alias: SuccessEnvelope\<T\>

> **SuccessEnvelope**\<`T`\> = `object`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:30](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L30)

Standard success response envelope.

## Remarks

Wraps a request ID alongside the response data.

## Example

```ts
const payload: SuccessEnvelope<string> = {
  status: 'success',
  requestId: 'req_123',
  data: 'ok',
};
```

## Type Parameters

### T

`T`

## Properties

### data

> **data**: `T` \| `null`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:33](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L33)

***

### requestId

> **requestId**: `string`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:32](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L32)

***

### status

> **status**: `"success"`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:31](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L31)
