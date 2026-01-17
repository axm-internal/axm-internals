[**@axm-internal/cli-kit**](../README.md)

***

[@axm-internal/cli-kit](../globals.md) / CommandContextForSchemas

# Type Alias: CommandContextForSchemas\<ArgsSchema, OptionsSchema\>

> **CommandContextForSchemas**\<`ArgsSchema`, `OptionsSchema`\> = `object`

Defined in: [createCommandDefinition.ts:15](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/createCommandDefinition.ts#L15)

Typed command context derived from args and options schemas.

## Remarks

Use this type when authoring command handlers for schema-aware commands.

## Example

```ts
type Ctx = CommandContextForSchemas<typeof argsSchema, typeof optionsSchema>;
```

## Type Parameters

### ArgsSchema

`ArgsSchema` *extends* `z.ZodObject`\<`z.ZodRawShape`\>

### OptionsSchema

`OptionsSchema` *extends* `z.ZodObject`\<`z.ZodRawShape`\>

## Properties

### args

> **args**: `z.infer`\<`ArgsSchema`\>

Defined in: [createCommandDefinition.ts:19](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/createCommandDefinition.ts#L19)

***

### container

> **container**: [`ContainerInterface`](../interfaces/ContainerInterface.md)

Defined in: [createCommandDefinition.ts:21](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/createCommandDefinition.ts#L21)

***

### options

> **options**: `z.infer`\<`OptionsSchema`\>

Defined in: [createCommandDefinition.ts:20](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/createCommandDefinition.ts#L20)
