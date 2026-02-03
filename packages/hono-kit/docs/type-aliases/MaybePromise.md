[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / MaybePromise

# Type Alias: MaybePromise\<T\>

> **MaybePromise**\<`T`\> = `T` \| `Promise`\<`T`\>

Defined in: [packages/hono-kit/src/server/types.ts:47](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L47)

A value that may be returned synchronously or as a Promise.

## Type Parameters

### T

`T`

## Remarks

Useful for lifecycle hooks that can be async.

## Example

```ts
const maybe: MaybePromise<void> = Promise.resolve();
```
