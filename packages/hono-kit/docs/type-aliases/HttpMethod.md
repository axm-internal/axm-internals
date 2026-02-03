[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / HttpMethod

# Type Alias: HttpMethod

> **HttpMethod** = `"get"` \| `"post"` \| `"put"` \| `"patch"` \| `"delete"` \| `"options"` \| `"head"` \| `"all"`

Defined in: [packages/hono-kit/src/routing/route.ts:16](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L16)

Supported HTTP methods for routes.

## Remarks

Includes `all` for Hono's match-all handler.

## Example

```ts
const method: HttpMethod = 'get';
```
