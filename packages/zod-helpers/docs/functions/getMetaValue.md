[**@axm-internal/zod-helpers**](../README.md)

***

[@axm-internal/zod-helpers](../globals.md) / getMetaValue

# Function: getMetaValue()

> **getMetaValue**\<`SchemaMeta`, `T`\>(`schema`, `name`): `SchemaMeta`\[keyof `SchemaMeta`\] \| `undefined`

Defined in: [utils.ts:35](https://github.com/axm-internal/axm-internals/blob/main/packages/zod-helpers/src/utils.ts#L35)

Read a single metadata value from a Zod schema.

## Type Parameters

### SchemaMeta

`SchemaMeta` *extends* `Record`\<`string`, `unknown`\>

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### schema

`T`

Schema holding metadata.

### name

keyof `SchemaMeta` & `string`

Metadata key to access.

## Returns

`SchemaMeta`\[keyof `SchemaMeta`\] \| `undefined`

The metadata value when present.

## Remarks

Returns undefined when the metadata key is missing.

## Example

```ts
const source = getMetaValue<{ source: string }>(schema, "source");
```
