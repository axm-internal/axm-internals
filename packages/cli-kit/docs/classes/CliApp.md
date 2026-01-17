[**@axm-internal/cli-kit**](../README.md)

***

[@axm-internal/cli-kit](../globals.md) / CliApp

# Class: CliApp

Defined in: [CliApp.ts:22](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L22)

Orchestrates CLI configuration, commands, and lifecycle hooks.

## Remarks

Manages command registration and delegates execution to Commander.js.

## Example

```ts
const app = new CliApp({ config: { name: 'my-cli' }, options: {} });
await app.start();
```

## Constructors

### Constructor

> **new CliApp**(`params`): `CliApp`

Defined in: [CliApp.ts:45](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L45)

Create a new CLI app instance.

#### Parameters

##### params

App configuration and options.

###### config

\{ `description?`: `string`; `name`: `string`; `version?`: `string`; \} = `CliConfigSchema`

###### config.description?

`string` = `...`

###### config.name

`string` = `...`

###### config.version?

`string` = `...`

###### options

\{ `commandDefinitions?`: `object`[]; `container?`: [`ContainerInterface`](../interfaces/ContainerInterface.md); `logger?`: `Logger`; `loggerAliases?`: [`InjectionToken`](../type-aliases/InjectionToken.md)\<`unknown`\>[]; `onError?`: `$InferOuterFunctionType`\<`ZodTuple`\<\[`ZodCustom`\<`Error`, `Error`\>\], `null`\>, `ZodVoid`\>; `onExit?`: `$InferOuterFunctionType`\<`ZodTuple`\<\[`ZodNumber`, `ZodOptional`\<`ZodCustom`\<`Error`, `Error`\>\>\], `null`\>, `ZodVoid`\>; `pretty`: `boolean`; \} = `CliOptionsSchema`

###### options.commandDefinitions?

`object`[] = `...`

###### options.container?

[`ContainerInterface`](../interfaces/ContainerInterface.md) = `...`

###### options.logger?

`Logger` = `...`

###### options.loggerAliases?

[`InjectionToken`](../type-aliases/InjectionToken.md)\<`unknown`\>[] = `...`

###### options.onError?

`$InferOuterFunctionType`\<`ZodTuple`\<\[`ZodCustom`\<`Error`, `Error`\>\], `null`\>, `ZodVoid`\> = `...`

###### options.onExit?

`$InferOuterFunctionType`\<`ZodTuple`\<\[`ZodNumber`, `ZodOptional`\<`ZodCustom`\<`Error`, `Error`\>\>\], `null`\>, `ZodVoid`\> = `...`

###### options.pretty

`boolean` = `...`

#### Returns

`CliApp`

Nothing.

#### Remarks

Validates input with Zod and registers a logger in the container.

#### Example

```ts
const app = new CliApp({ config: { name: 'my-cli' }, options: {} });
```

## Properties

### commandDefinitions

> `protected` **commandDefinitions**: `object`[]

Defined in: [CliApp.ts:26](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L26)

#### action

> **action**: `$InferOuterFunctionType`\<`ZodTuple`\<\[`ZodObject`\<\{ `args`: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<..., ..., ...\>; \}\>, `$strip`\>; `container`: `ZodType`\<[`ContainerInterface`](../interfaces/ContainerInterface.md), `unknown`, `$ZodTypeInternals`\<[`ContainerInterface`](../interfaces/ContainerInterface.md), `unknown`\>\>; `options`: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<..., ..., ...\>; \}\>, `$strip`\>; \}, `$strip`\>\], `null`\>, `ZodPromise`\<`ZodVoid`\>\>

#### argPositions?

> `optional` **argPositions**: `string`[]

#### argsSchema?

> `optional` **argsSchema**: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\>

#### description

> **description**: `string`

#### name

> **name**: `string`

#### optionsSchema?

> `optional` **optionsSchema**: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\>

***

### config

> `protected` **config**: `object`

Defined in: [CliApp.ts:24](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L24)

#### description?

> `optional` **description**: `string`

#### name

> **name**: `string`

#### version?

> `optional` **version**: `string`

***

### container

> `protected` **container**: [`ContainerInterface`](../interfaces/ContainerInterface.md)

Defined in: [CliApp.ts:25](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L25)

***

### initialized

> `protected` **initialized**: `boolean` = `false`

Defined in: [CliApp.ts:28](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L28)

***

### lastError?

> `protected` `optional` **lastError**: `Error`

Defined in: [CliApp.ts:29](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L29)

***

### logger

> `protected` **logger**: `Logger`

Defined in: [CliApp.ts:27](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L27)

***

### onError()?

> `protected` `optional` **onError**: (`error`) => `void`

Defined in: [CliApp.ts:30](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L30)

#### Parameters

##### error

`Error`

#### Returns

`void`

***

### onExit()?

> `protected` `optional` **onExit**: (`code`, `error?`) => `void`

Defined in: [CliApp.ts:31](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L31)

#### Parameters

##### code

`number`

##### error?

`Error`

#### Returns

`void`

***

### program

> `protected` **program**: `Command`

Defined in: [CliApp.ts:23](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L23)

## Methods

### addCommand()

> **addCommand**(`commandDefinition`): `void`

Defined in: [CliApp.ts:141](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L141)

Add a command definition to the app.

#### Parameters

##### commandDefinition

The command to add.

###### action

`$InferOuterFunctionType`\<`ZodTuple`\<\[`ZodObject`\<\{ `args`: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<..., ...\>\>; \}\>, `$strip`\>; `container`: `ZodType`\<[`ContainerInterface`](../interfaces/ContainerInterface.md), `unknown`, `$ZodTypeInternals`\<[`ContainerInterface`](../interfaces/ContainerInterface.md), `unknown`\>\>; `options`: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<..., ...\>\>; \}\>, `$strip`\>; \}, `$strip`\>\], `null`\>, `ZodPromise`\<`ZodVoid`\>\> = `...`

###### argPositions?

`string`[] = `...`

###### argsSchema?

`ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\> = `...`

###### description

`string` = `...`

###### name

`string` = `...`

###### optionsSchema?

`ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\> = `...`

#### Returns

`void`

Nothing.

#### Remarks

Appends to the existing command list.

#### Example

```ts
app.addCommand(definition);
```

***

### clearLastError()

> **clearLastError**(): `void`

Defined in: [CliApp.ts:109](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L109)

Clear the stored last error.

#### Returns

`void`

Nothing.

#### Remarks

Use before a new run if you track errors between runs.

#### Example

```ts
app.clearLastError();
```

***

### createLogger()

> `protected` **createLogger**(`appName`, `pretty`, `baseLogger?`): `Logger`

Defined in: [CliApp.ts:62](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L62)

#### Parameters

##### appName

`string`

##### pretty

`boolean`

##### baseLogger?

`Logger`

#### Returns

`Logger`

***

### getLastError()

> **getLastError**(): `Error` \| `undefined`

Defined in: [CliApp.ts:94](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L94)

Get the last error captured during execution.

#### Returns

`Error` \| `undefined`

The last error, or undefined if none.

#### Remarks

This value is set after `start` returns.

#### Example

```ts
const lastError = app.getLastError();
```

***

### getProgram()

> **getProgram**(): `Command`

Defined in: [CliApp.ts:79](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L79)

Access the underlying Commander program instance.

#### Returns

`Command`

The Commander program.

#### Remarks

Use this to add custom Commander configuration.

#### Example

```ts
const program = app.getProgram();
program.showHelpAfterError();
```

***

### init()

> `protected` **init**(): `void`

Defined in: [CliApp.ts:153](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L153)

#### Returns

`void`

***

### registerCommand()

> `protected` **registerCommand**(`commandDefinition`): `void`

Defined in: [CliApp.ts:145](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L145)

#### Parameters

##### commandDefinition

###### action

`$InferOuterFunctionType`\<`ZodTuple`\<\[`ZodObject`\<\{ `args`: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<..., ...\>\>; \}\>, `$strip`\>; `container`: `ZodType`\<[`ContainerInterface`](../interfaces/ContainerInterface.md), `unknown`, `$ZodTypeInternals`\<[`ContainerInterface`](../interfaces/ContainerInterface.md), `unknown`\>\>; `options`: `ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<..., ...\>\>; \}\>, `$strip`\>; \}, `$strip`\>\], `null`\>, `ZodPromise`\<`ZodVoid`\>\> = `...`

###### argPositions?

`string`[] = `...`

###### argsSchema?

`ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\> = `...`

###### description

`string` = `...`

###### name

`string` = `...`

###### optionsSchema?

`ZodObject`\<`Readonly`\<\{\[`k`: `string`\]: `$ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>; \}\>, `$strip`\> = `...`

#### Returns

`void`

***

### setCommands()

> **setCommands**(`commandDefinitions`): `void`

Defined in: [CliApp.ts:125](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L125)

Replace the command definitions for the app.

#### Parameters

##### commandDefinitions

`object`[]

The new command list.

#### Returns

`void`

Nothing.

#### Remarks

Existing definitions are overwritten.

#### Example

```ts
app.setCommands([definition]);
```

***

### start()

> **start**(): `Promise`\<`number`\>

Defined in: [CliApp.ts:191](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/CliApp.ts#L191)

Initialize and run the CLI.

#### Returns

`Promise`\<`number`\>

The process exit code.

#### Remarks

Returns 0 on success and 1 on command errors.

#### Example

```ts
const code = await app.start();
process.exit(code);
```
