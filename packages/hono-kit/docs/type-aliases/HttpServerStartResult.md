[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / HttpServerStartResult

# Type Alias: HttpServerStartResult

> **HttpServerStartResult** = `object`

Defined in: [packages/hono-kit/src/server/types.ts:131](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L131)

Result returned after starting the server.

## Remarks

Includes the server instance and a `stop` helper.

## Example

```ts
const { server, stop } = await honoServer.start({ hostname: '0.0.0.0', port: 3000 });
```

## Properties

### server

> **server**: [`BunServer`](BunServer.md)

Defined in: [packages/hono-kit/src/server/types.ts:132](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L132)

***

### stop()

> **stop**: (`reason?`) => `Promise`\<`void`\>

Defined in: [packages/hono-kit/src/server/types.ts:133](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L133)

#### Parameters

##### reason?

`string`

#### Returns

`Promise`\<`void`\>
