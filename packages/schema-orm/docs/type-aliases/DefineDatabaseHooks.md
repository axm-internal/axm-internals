[**@axm-internal/schema-orm**](../README.md)

***

[@axm-internal/schema-orm](../globals.md) / DefineDatabaseHooks

# Type Alias: DefineDatabaseHooks\<TModels\>

> **DefineDatabaseHooks**\<`TModels`\> = `object`

Defined in: [types.ts:21](https://github.com/axm-internal/axm-internals/blob/main/packages/schema-orm/src/types.ts#L21)

## Type Parameters

### TModels

`TModels` = `Record`\<`string`, `unknown`\>

## Properties

### onConnect()?

> `optional` **onConnect**: (`ctx`) => `void`

Defined in: [types.ts:22](https://github.com/axm-internal/axm-internals/blob/main/packages/schema-orm/src/types.ts#L22)

#### Parameters

##### ctx

[`DefineDatabaseHookContext`](DefineDatabaseHookContext.md)\<`TModels`\>

#### Returns

`void`

***

### onFirstCreate()?

> `optional` **onFirstCreate**: (`ctx`) => `void`

Defined in: [types.ts:23](https://github.com/axm-internal/axm-internals/blob/main/packages/schema-orm/src/types.ts#L23)

#### Parameters

##### ctx

[`DefineDatabaseHookContext`](DefineDatabaseHookContext.md)\<`TModels`\> & `object`

#### Returns

`void`

***

### onModelsReady()?

> `optional` **onModelsReady**: (`args`) => `void`

Defined in: [types.ts:25](https://github.com/axm-internal/axm-internals/blob/main/packages/schema-orm/src/types.ts#L25)

#### Parameters

##### args

###### models

`TModels`

#### Returns

`void`

***

### onSchemaChange()?

> `optional` **onSchemaChange**: (`args`) => `void`

Defined in: [types.ts:24](https://github.com/axm-internal/axm-internals/blob/main/packages/schema-orm/src/types.ts#L24)

#### Parameters

##### args

###### currentHash

`string`

###### storedHash

`string`

###### table

`string`

#### Returns

`void`
