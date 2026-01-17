[**@axm-internal/cli-kit**](../README.md)

***

[@axm-internal/cli-kit](../globals.md) / CliLogger

# Variable: CliLogger

> `const` **CliLogger**: [`InjectionToken`](../type-aliases/InjectionToken.md)\<`Logger`\> = `'CliLogger'`

Defined in: [constants.ts:15](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/constants.ts#L15)

Injection token used to register and resolve the CLI logger instance.

## Remarks

Use this token with a container to share a logger across commands.

## Example

```ts
container.registerInstance(CliLogger, logger);
const resolved = container.resolve(CliLogger);
```
