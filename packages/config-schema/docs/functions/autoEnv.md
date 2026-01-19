[**@axm-internal/config-schema**](../README.md)

***

[@axm-internal/config-schema](../globals.md) / autoEnv

# Function: autoEnv()

> **autoEnv**\<`T`\>(`schema`): `T`

Defined in: [env.ts:40](https://github.com/axm-internal/axm-internals/blob/main/packages/config-schema/src/env.ts#L40)

Tag a schema to infer its environment variable name from the config path.

## Type Parameters

### T

`T` *extends* `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

## Parameters

### schema

`T`

Schema that validates the variable value.

## Returns

`T`

The same schema with auto-env metadata attached.

## Remarks

The env name is inferred by the config loader using the schema path.

## Example

```ts
import { z } from 'zod';
import { autoEnv } from '@axm-internal/config-schema';

const config = z.object({
  logLevel: autoEnv(z.string()),
});
```
