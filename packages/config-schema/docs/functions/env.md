[**@axm-internal/config-schema**](../README.md)

***

[@axm-internal/config-schema](../globals.md) / env

# Function: env()

> **env**\<`T`\>(`name`, `schema`): `T`

Defined in: [env.ts:19](https://github.com/axm-internal/axm-internals/blob/main/packages/config-schema/src/env.ts#L19)

Tag a schema with a specific environment variable name.

## Type Parameters

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### name

`string`

Environment variable key to read.

### schema

`T`

Schema that validates the variable value.

## Returns

`T`

The same schema with env metadata attached.

## Remarks

The metadata is used when building the raw config from process.env.

## Example

```ts
import { z } from 'zod';
import { env } from '@axm-internal/config-schema';

const port = env('PORT', z.coerce.number());
```
