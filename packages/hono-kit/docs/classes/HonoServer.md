[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / HonoServer

# Class: HonoServer\<T\>

Defined in: [packages/hono-kit/src/server/HonoServer.ts:99](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/HonoServer.ts#L99)

Hono-based HTTP server wrapper with routing and response validation.

## Remarks

Handles route registration, response envelopes, and lifecycle hooks.

## Example

```ts
const server = new HonoServer({ name: 'api', routes });
await server.start({ hostname: '0.0.0.0', port: 3000 });
```

## Type Parameters

### T

`T` *extends* [`AppEnv`](../type-aliases/AppEnv.md) = [`AppEnv`](../type-aliases/AppEnv.md)

## Constructors

### Constructor

> **new HonoServer**\<`T`\>(`params`): `HonoServer`\<`T`\>

Defined in: [packages/hono-kit/src/server/HonoServer.ts:181](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/HonoServer.ts#L181)

Create a new `HonoServer`.

#### Parameters

##### params

`HonoServerParams`\<`T`\>

Server configuration and dependencies.

#### Returns

`HonoServer`\<`T`\>

#### Remarks

Registers routes and handlers immediately when provided.

#### Example

```ts
const server = new HonoServer({ name: 'api', routes });
```

## Properties

### app

> `readonly` **app**: `Hono`\<`T`\>

Defined in: [packages/hono-kit/src/server/HonoServer.ts:121](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/HonoServer.ts#L121)

Underlying Hono application instance.

#### Remarks

Use this to add middleware or routes directly when needed.

#### Example

```ts
server.app.get('/health', (c) => c.text('ok'));
```

***

### logger?

> `readonly` `optional` **logger**: `Logger`

Defined in: [packages/hono-kit/src/server/HonoServer.ts:143](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/HonoServer.ts#L143)

Optional logger instance used by the server.

#### Remarks

Provided via constructor params.

#### Example

```ts
if (server.logger) server.logger.info('server ready');
```

***

### name

> `readonly` **name**: `string`

Defined in: [packages/hono-kit/src/server/HonoServer.ts:110](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/HonoServer.ts#L110)

Server name used for logging and identification.

#### Remarks

This is the `name` passed to the constructor.

#### Example

```ts
console.log(server.name);
```

***

### routes

> `readonly` **routes**: [`RoutesCollection`](RoutesCollection.md)

Defined in: [packages/hono-kit/src/server/HonoServer.ts:132](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/HonoServer.ts#L132)

Normalized route collection for this server.

#### Remarks

Use `routes.items` to inspect registered routes.

#### Example

```ts
const routes = server.routes.items;
```

## Methods

### mount()

> **mount**(`routes`): `void`

Defined in: [packages/hono-kit/src/server/HonoServer.ts:233](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/HonoServer.ts#L233)

Add routes to the server and register them with the app.

#### Parameters

##### routes

[`RoutesInput`](../type-aliases/RoutesInput.md)

Routes to register.

#### Returns

`void`

Nothing.

#### Remarks

New routes are appended and registered immediately.

#### Example

```ts
server.mount(routes);
```

***

### start()

> **start**(`options`): `Promise`\<[`HttpServerStartResult`](../type-aliases/HttpServerStartResult.md)\>

Defined in: [packages/hono-kit/src/server/HonoServer.ts:252](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/server/HonoServer.ts#L252)

Start the underlying HTTP server.

#### Parameters

##### options

[`HttpServerStartOptions`](../type-aliases/HttpServerStartOptions.md)\<`T`\>

Host/port and optional lifecycle hooks.

#### Returns

`Promise`\<[`HttpServerStartResult`](../type-aliases/HttpServerStartResult.md)\>

The server instance and a stop helper.

#### Remarks

Uses `Bun.serve` by default unless a custom factory is provided.

#### Example

```ts
const { stop } = await server.start({ hostname: '0.0.0.0', port: 3000 });
```
