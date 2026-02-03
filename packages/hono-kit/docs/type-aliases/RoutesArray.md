[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RoutesArray

# Type Alias: RoutesArray

> **RoutesArray** = [`AnyRouteDefinition`](AnyRouteDefinition.md)[]

Defined in: [packages/hono-kit/src/server/types.ts:179](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L179)

Array form for route definitions.

## Remarks

Each entry must include method and path fields.

## Example

```ts
const routes: RoutesArray = [route({ method: 'get', path: '/health', schemas: {}, handler })];
```
