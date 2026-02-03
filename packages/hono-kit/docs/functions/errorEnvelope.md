[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / errorEnvelope

# Function: errorEnvelope()

> **errorEnvelope**(`params`): [`ErrorEnvelope`](../type-aliases/ErrorEnvelope.md)

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:95](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L95)

Build an error response envelope.

## Parameters

### params

Error details and request metadata.

#### errorCode?

`string`

#### errorMessage

`string`

#### errorStack?

`string`

#### requestId

`string`

#### statusCode

`number`

#### validationErrors?

[`ValidationErrorItem`](../type-aliases/ValidationErrorItem.md)[]

## Returns

[`ErrorEnvelope`](../type-aliases/ErrorEnvelope.md)

An error envelope payload.

## Remarks

Validation errors and stack traces are optional and should be included only when appropriate.

## Example

```ts
const payload = errorEnvelope({
  requestId: 'req_123',
  statusCode: 401,
  errorMessage: 'Unauthorized',
});
```
