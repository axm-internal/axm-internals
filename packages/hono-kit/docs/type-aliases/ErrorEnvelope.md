[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / ErrorEnvelope

# Type Alias: ErrorEnvelope

> **ErrorEnvelope** = `object`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:51](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L51)

Standard error response envelope.

## Remarks

Includes HTTP status and optional validation details.

## Example

```ts
const payload: ErrorEnvelope = {
  status: 'error',
  requestId: 'req_123',
  statusCode: 400,
  errorMessage: 'Validation failed',
};
```

## Properties

### errorCode?

> `optional` **errorCode**: `string`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:55](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L55)

***

### errorMessage

> **errorMessage**: `string`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:56](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L56)

***

### errorStack?

> `optional` **errorStack**: `string`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:58](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L58)

***

### requestId

> **requestId**: `string`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:53](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L53)

***

### status

> **status**: `"error"`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:52](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L52)

***

### statusCode

> **statusCode**: `number`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:54](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L54)

***

### validationErrors?

> `optional` **validationErrors**: [`ValidationErrorItem`](ValidationErrorItem.md)[]

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:57](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L57)
