[**@axm-internal/cli-kit**](../README.md)

***

[@axm-internal/cli-kit](../globals.md) / createCommandDefinition

# Function: createCommandDefinition()

> **createCommandDefinition**\<`ArgsSchema`, `OptionsSchema`\>(`definition`): `object`

Defined in: [createCommandDefinition.ts:42](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/createCommandDefinition.ts#L42)

Create a strongly-typed command definition.

## Type Parameters

### ArgsSchema

`ArgsSchema` *extends* `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\> = `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\>

### OptionsSchema

`OptionsSchema` *extends* `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\> = `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\>

## Parameters

### definition

Command metadata, schemas, and action handler.

#### action

(`ctx`) => `Promise`\<`void`\>

#### argPositions?

`string`[]

#### argsSchema?

`ArgsSchema`

#### description

`string`

#### name

`string`

#### optionsSchema?

`OptionsSchema`

## Returns

`object`

A command definition compatible with CLI registration.

### action

> **action**: `$InferOuterFunctionType`\<`ZodTuple`\<\[`ZodObject`\<\{ `args`: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<..., ...\>\>; \}\>, `$strip`\>; `container`: `ZodType`\<[`ContainerInterface`](../interfaces/ContainerInterface.md), `unknown`, `$ZodTypeInternals`\<[`ContainerInterface`](../interfaces/ContainerInterface.md), `unknown`\>\>; `options`: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<..., ...\>\>; \}\>, `$strip`\>; \}, `$strip`\>\], `null`\>, `ZodPromise`\<`ZodVoid`\>\>

### argPositions?

> `optional` **argPositions**: `string`[]

### argsSchema?

> `optional` **argsSchema**: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\>

### description

> **description**: `string`

### name

> **name**: `string`

### optionsSchema?

> `optional` **optionsSchema**: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\>

## Remarks

The returned object is cast to the canonical command definition shape.

## Example

```ts
const def = createCommandDefinition({
  name: 'hello',
  description: 'Say hello',
  action: async ({ options }) => {
    console.log(options);
  },
});
```
