[**@axm-internal/cli-kit**](../README.md)

***

[@axm-internal/cli-kit](../globals.md) / CliOutputService

# Class: CliOutputService

Defined in: [services/CliOutputService.ts:15](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/services/CliOutputService.ts#L15)

Lightweight console output helper for CLI apps.

## Remarks

This service wraps stdout/stderr and process exits without external side effects beyond logging.

## Example

```ts
const output = new CliOutputService();
output.log('Ready');
```

## Implements

- [`CliOutputServiceInterface`](../interfaces/CliOutputServiceInterface.md)

## Constructors

### Constructor

> **new CliOutputService**(): `CliOutputService`

#### Returns

`CliOutputService`

## Methods

### log()

> **log**(`message`): `void`

Defined in: [services/CliOutputService.ts:28](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/services/CliOutputService.ts#L28)

Log a plain message to stdout.

#### Parameters

##### message

`string`

The message to print.

#### Returns

`void`

Nothing.

#### Remarks

Use for standard, non-styled output.

#### Example

```ts
output.log('Starting...');
```

#### Implementation of

[`CliOutputServiceInterface`](../interfaces/CliOutputServiceInterface.md).[`log`](../interfaces/CliOutputServiceInterface.md#log)

***

### logError()

> **logError**(`message`): `void`

Defined in: [services/CliOutputService.ts:60](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/services/CliOutputService.ts#L60)

Log an error message to stderr.

#### Parameters

##### message

`string`

The error message to print.

#### Returns

`void`

Nothing.

#### Remarks

Prefer this for error output to keep stderr separated.

#### Example

```ts
output.logError('Failed');
```

#### Implementation of

[`CliOutputServiceInterface`](../interfaces/CliOutputServiceInterface.md).[`logError`](../interfaces/CliOutputServiceInterface.md#logerror)

***

### logSuccess()

> **logSuccess**(`message`): `void`

Defined in: [services/CliOutputService.ts:44](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/services/CliOutputService.ts#L44)

Log a success message to stdout with green formatting.

#### Parameters

##### message

`string`

The success message to print.

#### Returns

`void`

Nothing.

#### Remarks

Uses `chalk.green` to format the message.

#### Example

```ts
output.logSuccess('Done');
```

#### Implementation of

[`CliOutputServiceInterface`](../interfaces/CliOutputServiceInterface.md).[`logSuccess`](../interfaces/CliOutputServiceInterface.md#logsuccess)
