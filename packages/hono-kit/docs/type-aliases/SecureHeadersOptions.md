[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / SecureHeadersOptions

# Type Alias: SecureHeadersOptions

> **SecureHeadersOptions** = `Parameters`\<*typeof* `secureHeaders`\>\[`0`\]

Defined in: [packages/hono-kit/src/middleware/secureHeaders.ts:14](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/secureHeaders.ts#L14)

Options passed through to `hono/secure-headers`.

## Remarks

Use this to configure security-related HTTP headers.

## Example

```ts
const options: SecureHeadersOptions = { xFrameOptions: 'DENY' };
```
