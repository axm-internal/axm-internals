[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / ValidationSource

# Type Alias: ValidationSource

> **ValidationSource** = `"params"` \| `"query"` \| `"headers"` \| `"body"` \| `"response"`

Defined in: [packages/hono-kit/src/validation/inputValidation.ts:16](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/validation/inputValidation.ts#L16)

Input sources used for validation error paths.

## Remarks

Includes request and response sources.

## Example

```ts
const source: ValidationSource = 'query';
```
