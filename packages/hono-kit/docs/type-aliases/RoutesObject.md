[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RoutesObject

# Type Alias: RoutesObject

> **RoutesObject** = `Record`\<`string`, `Partial`\<`Record`\<[`HttpMethod`](HttpMethod.md), [`AnyRouteDefinition`](AnyRouteDefinition.md)\>\>\>

Defined in: [packages/hono-kit/src/server/types.ts:168](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L168)

Route definitions keyed by path and method.

## Remarks

Each path maps to a partial map of HTTP methods to route definitions.

## Example

```ts
const routes: RoutesObject = { '/health': { get: route({ method: 'get', path: '/health', schemas: {}, handler }) } };
```
