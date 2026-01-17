[**@axm-internal/cli-kit**](../README.md)

***

[@axm-internal/cli-kit](../globals.md) / CliOutputServiceInterface

# Interface: CliOutputServiceInterface

Defined in: [interfaces/CliOutputServiceInterface.ts:12](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/interfaces/CliOutputServiceInterface.ts#L12)

Abstraction for emitting CLI output.

## Remarks

Implementations can route output to stdout/stderr with optional styling.

## Example

```ts
const output: CliOutputServiceInterface = new CliOutputService();
output.log('Ready');
```

## Methods

### log()

> **log**(`message`): `void`

Defined in: [interfaces/CliOutputServiceInterface.ts:25](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/interfaces/CliOutputServiceInterface.ts#L25)

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

***

### logError()

> **logError**(`message`): `void`

Defined in: [interfaces/CliOutputServiceInterface.ts:53](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/interfaces/CliOutputServiceInterface.ts#L53)

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

***

### logSuccess()

> **logSuccess**(`message`): `void`

Defined in: [interfaces/CliOutputServiceInterface.ts:39](https://github.com/axm-internal/axm-internals/blob/main/packages/cli-kit/src/interfaces/CliOutputServiceInterface.ts#L39)

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
