[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / BunServer

# Type Alias: BunServer

> **BunServer** = `ReturnType`\<`BunServe`\>

Defined in: [packages/hono-kit/src/server/types.ts:36](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L36)

Bun server instance returned by `Bun.serve`.

## Remarks

Used for typing lifecycle hooks and server start results.

## Example

```ts
const server: BunServer = Bun.serve({ fetch: app.fetch, port: 3000 });
```
