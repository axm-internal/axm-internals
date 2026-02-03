[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / BearerAuthOptions

# Type Alias: BearerAuthOptions

> **BearerAuthOptions** = `Parameters`\<*typeof* `bearerAuth`\>\[`0`\]

Defined in: [packages/hono-kit/src/auth/types.ts:16](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/auth/types.ts#L16)

Options passed through to `hono/bearer-auth`.

## Remarks

Use this to configure the underlying bearer-auth middleware behavior.

## Example

```ts
const options: BearerAuthOptions = { prefix: 'Bearer' };
```
