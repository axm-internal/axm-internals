[**@axm/zod-helpers**](../README.md)

***

[@axm/zod-helpers](../globals.md) / AxiosInstanceSchema

# Variable: AxiosInstanceSchema

> `const` **AxiosInstanceSchema**: `ZodCustom`\<`AxiosInstance`, `AxiosInstance`\>

Defined in: [isAxiosInstance.ts:42](https://github.com/angelxmoreno/axm-internals/blob/main/packages/zod-helpers/src/isAxiosInstance.ts#L42)

Zod schema that validates Axios instances.

## Remarks

Uses a structural check to avoid tight coupling to Axios internals.

## Example

```ts
AxiosInstanceSchema.parse(axios.create());
```
