[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / validateResponseData

# Function: validateResponseData()

> **validateResponseData**\<`T`\>(`params`): `T`

Defined in: [packages/hono-kit/src/validation/responseValidation.ts:19](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/validation/responseValidation.ts#L19)

Validate response data with a Zod schema.

## Type Parameters

### T

`T`

## Parameters

### params

Response schema, data, and optional message.

#### data

`unknown`

#### message?

`string`

#### schema

`ZodType`\<`T`\>

## Returns

`T`

Parsed data when validation succeeds.

## Remarks

Throws a `ValidationError` when validation fails.

## Example

```ts
const data = validateResponseData({ schema: z.object({ ok: z.boolean() }), data: payload });
```
