[**@axm-internal/config-schema**](../README.md)

***

[@axm-internal/config-schema](../globals.md) / defineConfig

# Function: defineConfig()

> **defineConfig**\<`T`\>(`schema`, `options?`): `output`\<`T`\>

Defined in: [defineConfig.ts:28](https://github.com/axm-internal/axm-internals/blob/main/packages/config-schema/src/defineConfig.ts#L28)

Build a typed config object from a Zod schema and environment variables.

## Type Parameters

### T

`T` *extends* `ZodObject`\<`$ZodLooseShape`, `$strip`\>

## Parameters

### schema

`T`

Zod object schema describing the config shape.

### options?

`BootOptions`

Boot options for environment loading.

## Returns

`output`\<`T`\>

The parsed config object.

## Remarks

Throws a formatted error when schema validation fails.

## Example

```ts
import { z } from 'zod';
import { defineConfig, env } from '@axm-internal/config-schema';

const config = defineConfig(
  z.object({
    port: env('PORT', z.coerce.number()),
  }),
);
```
