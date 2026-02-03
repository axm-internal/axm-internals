[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RouteDefinition

# Type Alias: RouteDefinition\<TSchemas, TEnv\>

> **RouteDefinition**\<`TSchemas`, `TEnv`\> = `object`

Defined in: [packages/hono-kit/src/routing/route.ts:94](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L94)

Definition for a single route.

## Remarks

Route definitions are produced by the `route()` helper.

## Example

```ts
const definition: RouteDefinition<RouteInputSchemas> = {
  kind: 'route',
  method: 'get',
  path: '/health',
  schemas: {},
  handler: (c) => c.text('ok'),
};
```

## Type Parameters

### TSchemas

`TSchemas` *extends* [`RouteInputSchemas`](RouteInputSchemas.md)

### TEnv

`TEnv` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### authorized?

> `optional` **authorized**: `boolean`

Defined in: [packages/hono-kit/src/routing/route.ts:98](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L98)

***

### handler

> **handler**: [`RouteHandler`](RouteHandler.md)\<`TSchemas`, `TEnv`\>

Defined in: [packages/hono-kit/src/routing/route.ts:100](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L100)

***

### kind

> **kind**: `"route"`

Defined in: [packages/hono-kit/src/routing/route.ts:95](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L95)

***

### method?

> `optional` **method**: [`HttpMethod`](HttpMethod.md)

Defined in: [packages/hono-kit/src/routing/route.ts:96](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L96)

***

### path?

> `optional` **path**: `string`

Defined in: [packages/hono-kit/src/routing/route.ts:97](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L97)

***

### schemas

> **schemas**: `TSchemas`

Defined in: [packages/hono-kit/src/routing/route.ts:99](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L99)
