[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createHonoServer

# Function: createHonoServer()

> **createHonoServer**\<`TEnv`\>(`options`): [`HonoServer`](../classes/HonoServer.md)\<`TEnv`\>

Defined in: [packages/hono-kit/src/server/createHonoServer.ts:19](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/createHonoServer.ts#L19)

Create a `HonoServer` with defaults and middleware wiring.

## Type Parameters

### TEnv

`TEnv` *extends* [`AppEnv`](../type-aliases/AppEnv.md) = [`AppEnv`](../type-aliases/AppEnv.md)

## Parameters

### options

[`CreateHonoServerOptions`](../type-aliases/CreateHonoServerOptions.md)\<`TEnv`\>

Server configuration and middleware options.

## Returns

[`HonoServer`](../classes/HonoServer.md)\<`TEnv`\>

A configured `HonoServer` instance.

## Remarks

Default middleware are computed from `options.defaults`, `cors`, and `secureHeaders`.

## Example

```ts
const server = createHonoServer({ name: 'api', routes });
```
