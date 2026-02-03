[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / route

# Function: route()

> **route**\<`TSchemas`, `TEnv`\>(`params`): [`RouteDefinition`](../type-aliases/RouteDefinition.md)\<`TSchemas`, `TEnv`\>

Defined in: [packages/hono-kit/src/routing/route.ts:159](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L159)

Create a typed route definition.

## Type Parameters

### TSchemas

`TSchemas` *extends* [`RouteInputSchemas`](../type-aliases/RouteInputSchemas.md)

### TEnv

`TEnv` *extends* [`AppEnv`](../type-aliases/AppEnv.md) = [`AppEnv`](../type-aliases/AppEnv.md)

## Parameters

### params

[`RouteParams`](../type-aliases/RouteParams.md)\<`TSchemas`, `TEnv`\>

Route configuration and handler.

## Returns

[`RouteDefinition`](../type-aliases/RouteDefinition.md)\<`TSchemas`, `TEnv`\>

A normalized route definition object.

## Remarks

Use this helper to standardize route metadata for registration.

## Example

```ts
const definition = route({
  method: 'get',
  path: '/health',
  schemas: {},
  handler: (c) => c.text('ok'),
});
```
