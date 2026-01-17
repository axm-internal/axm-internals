[**@axm-internal/cli-kit**](../README.md)

***

[@axm-internal/cli-kit](../globals.md) / InMemoryContainer

# Class: InMemoryContainer

Defined in: [containers/InMemoryContainer.ts:14](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/containers/InMemoryContainer.ts#L14)

Simple in-memory container for registering and resolving instances.

## Remarks

Intended for lightweight CLI apps that do not require advanced DI features.

## Example

```ts
const container = new InMemoryContainer();
container.registerInstance('Logger', console);
```

## Implements

- [`ContainerInterface`](../interfaces/ContainerInterface.md)

## Constructors

### Constructor

> **new InMemoryContainer**(): `InMemoryContainer`

#### Returns

`InMemoryContainer`

## Properties

### store

> `readonly` **store**: `Map`\<[`InjectionToken`](../type-aliases/InjectionToken.md), `unknown`\>

Defined in: [containers/InMemoryContainer.ts:25](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/containers/InMemoryContainer.ts#L25)

Map of registered instances keyed by injection token.

#### Remarks

Direct access is provided mainly for diagnostics.

#### Example

```ts
const hasLogger = container.store.has('Logger');
```

## Methods

### registerInstance()

> **registerInstance**\<`T`\>(`token`, `instance`): [`ContainerInterface`](../interfaces/ContainerInterface.md)

Defined in: [containers/InMemoryContainer.ts:60](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/containers/InMemoryContainer.ts#L60)

Register an instance for a token.

#### Type Parameters

##### T

`T`

#### Parameters

##### token

[`InjectionToken`](../type-aliases/InjectionToken.md)\<`T`\>

The token used to identify the instance.

##### instance

`T`

The instance to register.

#### Returns

[`ContainerInterface`](../interfaces/ContainerInterface.md)

The container for chaining.

#### Remarks

Replaces any existing instance for the same token.

#### Example

```ts
container.registerInstance('Logger', console);
```

#### Implementation of

[`ContainerInterface`](../interfaces/ContainerInterface.md).[`registerInstance`](../interfaces/ContainerInterface.md#registerinstance)

***

### resolve()

> **resolve**\<`T`\>(`token`): `T`

Defined in: [containers/InMemoryContainer.ts:39](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/containers/InMemoryContainer.ts#L39)

Resolve a registered instance.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### token

[`InjectionToken`](../type-aliases/InjectionToken.md)\<`T`\>

The token used to identify the instance.

#### Returns

`T`

The registered instance.

#### Remarks

Throws when the token has no registered instance.

#### Example

```ts
const logger = container.resolve('Logger');
```

#### Implementation of

[`ContainerInterface`](../interfaces/ContainerInterface.md).[`resolve`](../interfaces/ContainerInterface.md#resolve)
