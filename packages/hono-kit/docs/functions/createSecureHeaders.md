[**@axm-internal/hono-kit**](../README.md)

***

[@axm-internal/hono-kit](../globals.md) / createSecureHeaders

# Function: createSecureHeaders()

> **createSecureHeaders**(`options?`): `MiddlewareHandler`

Defined in: [packages/hono-kit/src/middleware/secureHeaders.ts:28](https://github.com/axm-internal/axm-internals/blob/main/packages/hono-kit/src/middleware/secureHeaders.ts#L28)

Create a secure-headers middleware instance.

## Parameters

### options?

`SecureHeadersOptions`

Secure header configuration options.

## Returns

`MiddlewareHandler`

A Hono middleware that applies secure headers.

## Remarks

Delegates to `hono/secure-headers` for implementation.

## Example

```ts
const secureHeaders = createSecureHeaders();
```
