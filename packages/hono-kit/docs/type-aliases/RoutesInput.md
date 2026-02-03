[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RoutesInput

# Type Alias: RoutesInput

> **RoutesInput** = [`RoutesObject`](RoutesObject.md) \| [`RoutesArray`](RoutesArray.md)

Defined in: [packages/hono-kit/src/server/types.ts:190](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L190)

Any accepted route input structure.

## Remarks

Supports both object and array route definitions.

## Example

```ts
const routes: RoutesInput = { '/health': { get: route({ method: 'get', path: '/health', schemas: {}, handler }) } };
```
