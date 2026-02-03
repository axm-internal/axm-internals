[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / getIsDevelopment

# Function: getIsDevelopment()

> **getIsDevelopment**\<`T`\>(`c`): `boolean`

Defined in: [packages/hono-kit/src/server/isDevelopment.ts:19](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/isDevelopment.ts#L19)

Read the `isDevelopment` flag from the request context.

## Type Parameters

### T

`T` *extends* [`AppEnv`](../type-aliases/AppEnv.md)

## Parameters

### c

`Context`\<`T`\>

Hono context.

## Returns

`boolean`

`true` when the request is marked as development mode.

## Remarks

This value is set by `HonoServer` when configured.

## Example

```ts
if (getIsDevelopment(c)) {
  console.log('development mode');
}
```
