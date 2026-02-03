[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / HttpServerLifecycleHooks

# Type Alias: HttpServerLifecycleHooks\<T\>

> **HttpServerLifecycleHooks**\<`T`\> = `object`

Defined in: [packages/hono-kit/src/server/types.ts:97](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L97)

Lifecycle hooks for server start/stop events.

## Remarks

Hooks may be sync or async and are invoked around server lifecycle transitions.

## Example

```ts
const hooks: HttpServerLifecycleHooks = {
  beforeStart: () => console.log('starting'),
};
```

## Type Parameters

### T

`T` *extends* [`AppEnv`](AppEnv.md) = [`AppEnv`](AppEnv.md)

## Properties

### afterStart()?

> `optional` **afterStart**: (`context`) => [`MaybePromise`](MaybePromise.md)\<`void`\>

Defined in: [packages/hono-kit/src/server/types.ts:99](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L99)

#### Parameters

##### context

[`LifecycleContext`](LifecycleContext.md)\<`T`\>

#### Returns

[`MaybePromise`](MaybePromise.md)\<`void`\>

***

### afterStop()?

> `optional` **afterStop**: (`context`) => [`MaybePromise`](MaybePromise.md)\<`void`\>

Defined in: [packages/hono-kit/src/server/types.ts:101](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L101)

#### Parameters

##### context

###### app

`Hono`\<`T`\>

###### logger?

`Logger`

###### reason?

`string`

#### Returns

[`MaybePromise`](MaybePromise.md)\<`void`\>

***

### beforeStart()?

> `optional` **beforeStart**: () => [`MaybePromise`](MaybePromise.md)\<`void`\>

Defined in: [packages/hono-kit/src/server/types.ts:98](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L98)

#### Returns

[`MaybePromise`](MaybePromise.md)\<`void`\>

***

### beforeStop()?

> `optional` **beforeStop**: (`context`) => [`MaybePromise`](MaybePromise.md)\<`void`\>

Defined in: [packages/hono-kit/src/server/types.ts:100](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/types.ts#L100)

#### Parameters

##### context

[`LifecycleContext`](LifecycleContext.md)\<`T`\> & `object`

#### Returns

[`MaybePromise`](MaybePromise.md)\<`void`\>
