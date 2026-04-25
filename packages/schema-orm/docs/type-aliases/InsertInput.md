[**@axm-internal/schema-orm**](../README.md)

***

[@axm-internal/schema-orm](../globals.md) / InsertInput

# Type Alias: InsertInput\<TSchema\>

> **InsertInput**\<`TSchema`\> = `OptionalizeKeys`\<`z.input`\<`TSchema`\>, `Extract`\<`OptionalInsertKeys`\<`ShapeOf`\<`TSchema`\>\>, keyof `z.input`\<`TSchema`\>\>\>

Defined in: [types.ts:72](https://github.com/axm-internal/axm-internals/blob/main/packages/schema-orm/src/types.ts#L72)

## Type Parameters

### TSchema

`TSchema` *extends* `z.ZodObject`\<`z.ZodRawShape`\>
