[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / AnyRouteDefinition

# Type Alias: AnyRouteDefinition

> **AnyRouteDefinition** = [`RouteDefinition`](RouteDefinition.md)\<[`RouteInputSchemas`](RouteInputSchemas.md), [`AppEnv`](AppEnv.md)\>

Defined in: [packages/hono-kit/src/routing/route.ts:113](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L113)

Convenience type for any supported route definition.

## Remarks

Useful when aggregating routes of different schema shapes.

## Example

```ts
const routes: AnyRouteDefinition[] = [route({ method: 'get', path: '/', schemas: {}, handler })];
```
