[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RouteInputSchemas

# Type Alias: RouteInputSchemas

> **RouteInputSchemas** = `object`

Defined in: [packages/hono-kit/src/routing/route.ts:28](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L28)

Schemas used to validate route inputs and responses.

## Remarks

Provide Zod schemas for any inputs that should be validated.

## Example

```ts
const schemas: RouteInputSchemas = { query: z.object({ q: z.string() }) };
```

## Properties

### body?

> `optional` **body**: `z.ZodType`

Defined in: [packages/hono-kit/src/routing/route.ts:32](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L32)

***

### headers?

> `optional` **headers**: `z.ZodType`

Defined in: [packages/hono-kit/src/routing/route.ts:31](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L31)

***

### params?

> `optional` **params**: `z.ZodType`

Defined in: [packages/hono-kit/src/routing/route.ts:29](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L29)

***

### query?

> `optional` **query**: `z.ZodType`

Defined in: [packages/hono-kit/src/routing/route.ts:30](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L30)

***

### response?

> `optional` **response**: `z.ZodType`

Defined in: [packages/hono-kit/src/routing/route.ts:33](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/route.ts#L33)
