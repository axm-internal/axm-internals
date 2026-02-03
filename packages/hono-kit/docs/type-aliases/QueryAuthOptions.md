[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / QueryAuthOptions

# Type Alias: QueryAuthOptions

> **QueryAuthOptions** = `object`

Defined in: [packages/hono-kit/src/auth/types.ts:28](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L28)

Options for query-parameter token authentication.

## Remarks

Use `paramKey` to customize the query string key used for the token.

## Example

```ts
const options: QueryAuthOptions = { paramKey: 'api-key' };
```

## Properties

### paramKey?

> `optional` **paramKey**: `string`

Defined in: [packages/hono-kit/src/auth/types.ts:29](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L29)
