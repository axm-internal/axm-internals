[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RouteInputs

# Type Alias: RouteInputs\<TSchemas\>

> **RouteInputs**\<`TSchemas`\> = `object`

Defined in: [packages/hono-kit/src/routing/route.ts:55](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L55)

Typed inputs produced for a route handler.

## Remarks

Each property matches the output type of its schema.

## Example

```ts
type Inputs = RouteInputs<{ query: z.ZodType<{ q: string }> }>;
```

## Type Parameters

### TSchemas

`TSchemas` *extends* [`RouteInputSchemas`](RouteInputSchemas.md)

## Properties

### body

> **body**: `SchemaOutput`\<`TSchemas`\[`"body"`\]\>

Defined in: [packages/hono-kit/src/routing/route.ts:59](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L59)

***

### headers

> **headers**: `SchemaOutput`\<`TSchemas`\[`"headers"`\]\>

Defined in: [packages/hono-kit/src/routing/route.ts:58](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L58)

***

### params

> **params**: `SchemaOutput`\<`TSchemas`\[`"params"`\]\>

Defined in: [packages/hono-kit/src/routing/route.ts:56](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L56)

***

### query

> **query**: `SchemaOutput`\<`TSchemas`\[`"query"`\]\>

Defined in: [packages/hono-kit/src/routing/route.ts:57](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L57)
