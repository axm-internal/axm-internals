[**@axm-internal/cli-kit**](../README.md)

***

[@axm-internal/cli-kit](../globals.md) / InjectionToken

# Type Alias: InjectionToken\<T\>

> **InjectionToken**\<`T`\> = (...`args`) => `T` \| `string` \| `symbol`

Defined in: [interfaces/ContainerInterface.ts:15](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/interfaces/ContainerInterface.ts#L15)

Token used to register and resolve values from a container.

## Type Parameters

### T

`T` = `unknown`

## Remarks

Tokens can be class constructors, strings, or symbols.

## Example

```ts
const token: InjectionToken = 'MyService';
```
