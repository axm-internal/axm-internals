[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RouteHandler

# Type Alias: RouteHandler()\<TSchemas, TEnv\>

> **RouteHandler**\<`TSchemas`, `TEnv`\> = (`c`, `input`) => `Response` \| `Promise`\<`Response`\>

Defined in: [packages/hono-kit/src/routing/route.ts:73](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L73)

Handler function for a typed route.

## Type Parameters

### TSchemas

`TSchemas` *extends* [`RouteInputSchemas`](RouteInputSchemas.md)

### TEnv

`TEnv` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Parameters

### c

`Context`\<`TEnv`\>

### input

[`RouteInputs`](RouteInputs.md)\<`TSchemas`\>

## Returns

`Response` \| `Promise`\<`Response`\>

## Remarks

Receives the Hono context and validated inputs.

## Example

```ts
const handler: RouteHandler<{ query: z.ZodType<{ q: string }> }> = (c, input) =>
  c.json({ query: input.query });
```
