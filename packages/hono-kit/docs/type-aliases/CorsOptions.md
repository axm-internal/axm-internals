[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / CorsOptions

# Type Alias: CorsOptions

> **CorsOptions** = `Parameters`\<*typeof* `cors`\>\[`0`\]

Defined in: [packages/hono-kit/src/middleware/cors.ts:14](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/cors.ts#L14)

Options passed through to `hono/cors`.

## Remarks

Use this to configure allowed origins, headers, and methods.

## Example

```ts
const options: CorsOptions = { origin: ['https://example.com'] };
```
