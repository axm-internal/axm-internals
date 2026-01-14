[**@axm/zod-helpers**](../README.md)

***

[@axm/zod-helpers](../globals.md) / PinoInstanceSchema

# Variable: PinoInstanceSchema

> `const` **PinoInstanceSchema**: `ZodCustom`\<`Logger`, `Logger`\>

Defined in: [isPinoLogger.ts:45](https://github.com/angelxmoreno/axm-internals/blob/main/packages/zod-helpers/src/isPinoLogger.ts#L45)

Zod schema that validates Pino logger instances.

## Remarks

Uses a structural check to avoid tight coupling to Pino internals.

## Example

```ts
PinoInstanceSchema.parse(pino());
```
