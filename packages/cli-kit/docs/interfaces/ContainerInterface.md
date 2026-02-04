[**@axm-internal/cli-kit**](../README.md)

***

[@axm-internal/cli-kit](../globals.md) / ContainerInterface

# Interface: ContainerInterface

Defined in: [interfaces/ContainerInterface.ts:43](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/interfaces/ContainerInterface.ts#L43)

Minimal dependency injection container interface.

## Remarks

Implementations must support registering and resolving instances by token.

## Example

```ts
const container: ContainerInterface = new InMemoryContainer();
container.registerInstance('Logger', console);
```

## Methods

### registerInstance()

> **registerInstance**\<`T`\>(`token`, `instance`): `ContainerInterface`

Defined in: [interfaces/ContainerInterface.ts:57](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/interfaces/ContainerInterface.ts#L57)

Register a concrete instance for a token.

#### Type Parameters

##### T

`T`

#### Parameters

##### token

[`InjectionToken`](../type-aliases/InjectionToken.md)\<`T`\>

The token used to identify the instance.

##### instance

`T`

The instance to store.

#### Returns

`ContainerInterface`

The container for chaining.

#### Remarks

Overwrites any existing instance for the same token.

#### Example

```ts
container.registerInstance('Logger', console);
```

***

### resolve()

> **resolve**\<`T`\>(`token`): `T`

Defined in: [interfaces/ContainerInterface.ts:70](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/interfaces/ContainerInterface.ts#L70)

Resolve a previously registered instance.

#### Type Parameters

##### T

`T`

#### Parameters

##### token

[`InjectionToken`](../type-aliases/InjectionToken.md)\<`T`\>

The token used to identify the instance.

#### Returns

`T`

The registered instance.

#### Remarks

Implementations should throw when the token is missing.

#### Example

```ts
const logger = container.resolve('Logger');
```
