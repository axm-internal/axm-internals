[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / RoutesCollection

# Class: RoutesCollection

Defined in: [packages/hono-kit/src/server/RoutesCollection.ts:74](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/RoutesCollection.ts#L74)

Collection of normalized route definitions.

## Remarks

Accepts routes in array or object form and normalizes them for registration.

## Example

```ts
const collection = new RoutesCollection(routes);
collection.add(route({ method: 'get', path: '/health', schemas: {}, handler }));
```

## Constructors

### Constructor

> **new RoutesCollection**(`initial?`): `RoutesCollection`

Defined in: [packages/hono-kit/src/server/RoutesCollection.ts:95](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/RoutesCollection.ts#L95)

Create a new routes collection.

#### Parameters

##### initial?

[`RoutesInput`](../type-aliases/RoutesInput.md)

Optional initial routes to add.

#### Returns

`RoutesCollection`

#### Remarks

Initial routes are normalized and stored immediately.

#### Example

```ts
const collection = new RoutesCollection(routes);
```

## Accessors

### items

#### Get Signature

> **get** **items**(): readonly `NormalizedRouteDefinition`[]

Defined in: [packages/hono-kit/src/server/RoutesCollection.ts:133](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/RoutesCollection.ts#L133)

Get the normalized route definitions.

##### Remarks

The returned array should be treated as read-only.

##### Example

```ts
const routes = collection.items;
```

##### Returns

readonly `NormalizedRouteDefinition`[]

An immutable view of the stored routes.

## Methods

### add()

> **add**(`input`): `void`

Defined in: [packages/hono-kit/src/server/RoutesCollection.ts:113](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/RoutesCollection.ts#L113)

Add routes to the collection.

#### Parameters

##### input

[`RoutesInput`](../type-aliases/RoutesInput.md)

Routes in array or object form.

#### Returns

`void`

Nothing.

#### Remarks

Routes are normalized before being stored.

#### Example

```ts
collection.add([{ kind: 'route', method: 'get', path: '/health', schemas: {}, handler }]);
```

***

### toJSON()

> **toJSON**(): `RouteMetadata`[]

Defined in: [packages/hono-kit/src/server/RoutesCollection.ts:148](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/RoutesCollection.ts#L148)

Serialize route metadata for inspection.

#### Returns

`RouteMetadata`[]

Simplified route metadata.

#### Remarks

Excludes schema and handler data from the output.

#### Example

```ts
const metadata = collection.toJSON();
```
