[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / validateInput

# Function: validateInput()

> **validateInput**\<`T`\>(`params`): `T`

Defined in: [packages/hono-kit/src/validation/inputValidation.ts:75](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/validation/inputValidation.ts#L75)

Validate an input value with a Zod schema.

## Type Parameters

### T

`T`

## Parameters

### params

Validation configuration and input value.

#### message?

`string`

#### schema

`ZodType`\<`T`\>

#### source

[`ValidationSource`](../type-aliases/ValidationSource.md)

#### value

`unknown`

## Returns

`T`

Parsed data when validation succeeds.

## Remarks

Throws a `ValidationError` when validation fails.

## Example

```ts
const data = validateInput({ source: 'body', schema: z.object({ id: z.string() }), value: payload });
```
