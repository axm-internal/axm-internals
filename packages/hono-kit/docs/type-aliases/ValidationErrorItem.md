[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / ValidationErrorItem

# Type Alias: ValidationErrorItem

> **ValidationErrorItem** = `object`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:11](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L11)

A single validation error detail.

## Remarks

Used in error envelopes for validation failures.

## Example

```ts
const item: ValidationErrorItem = { path: 'body.email', message: 'Invalid email' };
```

## Properties

### message

> **message**: `string`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:13](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L13)

***

### path

> **path**: `string`

Defined in: [packages/hono-kit/src/errors/responseEnvelopes.ts:12](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/errors/responseEnvelopes.ts#L12)
