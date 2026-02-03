[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / formatValidationPath

# Function: formatValidationPath()

> **formatValidationPath**(`source`, `path`): `string`

Defined in: [packages/hono-kit/src/validation/inputValidation.ts:32](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/validation/inputValidation.ts#L32)

Format a validation path for error reporting.

## Parameters

### source

[`ValidationSource`](../type-aliases/ValidationSource.md)

The validation source.

### path

`PropertyKey`[]

Zod issue path segments.

## Returns

`string`

A dot/bracket notation path string.

## Remarks

Numeric segments are rendered as array indices.

## Example

```ts
const path = formatValidationPath('body', ['user', 0, 'email']);
// => "body.user[0].email"
```
