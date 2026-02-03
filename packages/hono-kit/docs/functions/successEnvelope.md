[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / successEnvelope

# Function: successEnvelope()

> **successEnvelope**\<`T`\>(`params`): [`SuccessEnvelope`](../type-aliases/SuccessEnvelope.md)\<`T`\>

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:73](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L73)

Build a success response envelope.

## Type Parameters

### T

`T`

## Parameters

### params

Request metadata and response data.

#### data

`T` \| `null`

#### requestId

`string`

## Returns

[`SuccessEnvelope`](../type-aliases/SuccessEnvelope.md)\<`T`\>

A success envelope payload.

## Remarks

Use this to standardize successful responses.

## Example

```ts
const payload = successEnvelope({ requestId: 'req_123', data: { ok: true } });
```
