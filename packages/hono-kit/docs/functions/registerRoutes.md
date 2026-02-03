[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / registerRoutes

# Function: registerRoutes()

> **registerRoutes**\<`T`\>(`params`): `void`

Defined in: [packages/hono-kit/src/routing/registerRoutes.ts:97](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/routing/registerRoutes.ts#L97)

Register a collection of routes on a Hono application.

## Type Parameters

### T

`T` *extends* [`AppEnv`](../type-aliases/AppEnv.md)

## Parameters

### params

Application, routes, and optional hooks for registration.

#### app

`Hono`\<`T`\>

#### getRouteMiddlewares?

`RegisterRouteMiddleware`\<`T`\>

#### handleRoute?

`RegisterRouteHandler`\<`T`\>

#### routePrefix?

`string`

#### routes

[`RoutesCollection`](../classes/RoutesCollection.md)

## Returns

`void`

Nothing.

## Remarks

Routes are normalized and registered with optional middleware and custom handlers.

## Example

```ts
registerRoutes({ app, routes, routePrefix: '/api' });
```
