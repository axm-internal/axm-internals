[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RouteParams

# Type Alias: RouteParams\<TSchemas, TEnv\>

> **RouteParams**\<`TSchemas`, `TEnv`\> = `object`

Defined in: [packages/hono-kit/src/routing/route.ts:130](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L130)

Parameters accepted by the `route()` helper.

## Remarks

Use this type when building factories that generate routes.

## Example

```ts
const params: RouteParams<RouteInputSchemas> = {
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

Defined in: [packages/hono-kit/src/routing/route.ts:133](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L133)

***

### body?

> `optional` **body**: `TSchemas`\[`"body"`\]

Defined in: [packages/hono-kit/src/routing/route.ts:137](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L137)

***

### handler

> **handler**: [`RouteHandler`](RouteHandler.md)\<`TSchemas`, `TEnv`\>

Defined in: [packages/hono-kit/src/routing/route.ts:139](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L139)

***

### headers?

> `optional` **headers**: `TSchemas`\[`"headers"`\]

Defined in: [packages/hono-kit/src/routing/route.ts:136](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L136)

***

### method?

> `optional` **method**: [`HttpMethod`](HttpMethod.md)

Defined in: [packages/hono-kit/src/routing/route.ts:131](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L131)

***

### params?

> `optional` **params**: `TSchemas`\[`"params"`\]

Defined in: [packages/hono-kit/src/routing/route.ts:134](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L134)

***

### path?

> `optional` **path**: `string`

Defined in: [packages/hono-kit/src/routing/route.ts:132](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L132)

***

### query?

> `optional` **query**: `TSchemas`\[`"query"`\]

Defined in: [packages/hono-kit/src/routing/route.ts:135](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L135)

***

### response?

> `optional` **response**: `TSchemas`\[`"response"`\]

Defined in: [packages/hono-kit/src/routing/route.ts:138](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L138)
