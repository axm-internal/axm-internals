[**@axm-internal/zod-helpers**](../README.md)

***

[@axm-internal/zod-helpers](../globals.md) / getSchemaMeta

# Function: getSchemaMeta()

> **getSchemaMeta**\<`SchemaMeta`, `T`\>(`schema`): `SchemaMeta`

Defined in: [utils.ts:16](https://github.com/axm-internal/axm-internals/blob/main/packages/zod-helpers/src/utils.ts#L16)

Read the metadata object attached to a Zod schema.

## Type Parameters

### SchemaMeta

`SchemaMeta` *extends* `Record`\<`string`, `unknown`\>

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\> = `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### schema

`T`

Schema holding metadata.

## Returns

`SchemaMeta`

The metadata object or an empty object when absent.

## Remarks

Zod metadata is optional, so this always returns a safe object.

## Example

```ts
const meta = getSchemaMeta<{ source: string }>(schema);
console.log(meta.source);
```
