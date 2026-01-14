import type { AxiosInstance } from 'axios';
import { z } from 'zod';

/**
 * Runtime type guard for Axios instances.
 *
 * @param value - Unknown value to check.
 * @returns True when the value behaves like an Axios instance.
 * @remarks
 * Axios instances can be functions or objects, but must expose a `request` method.
 * @example
 * ```ts
 * const client = axios.create();
 * if (!isAxiosInstance(client)) {
 *   throw new Error("Not an axios instance");
 * }
 * ```
 */
const isAxiosInstance = (value: unknown): value is AxiosInstance => {
    if (!value) {
        return false;
    }

    const valueType = typeof value;
    if (valueType !== 'function' && valueType !== 'object') {
        return false;
    }

    return typeof (value as AxiosInstance).request === 'function';
};

/**
 * Zod schema that validates Axios instances.
 *
 * @remarks
 * Uses a structural check to avoid tight coupling to Axios internals.
 * @example
 * ```ts
 * AxiosInstanceSchema.parse(axios.create());
 * ```
 */
export const AxiosInstanceSchema = z.custom<AxiosInstance>(isAxiosInstance, {
    message: 'A valid Axios instance is required.',
});
