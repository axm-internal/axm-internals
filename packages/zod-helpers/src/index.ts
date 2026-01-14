/**
 * Zod schemas for common runtime type guards.
 *
 * @remarks
 * Exported schemas use structural checks for lightweight runtime validation.
 * @example
 * ```ts
 * import { AxiosInstanceSchema, PinoInstanceSchema } from "@axm/zod-helpers";
 *
 * AxiosInstanceSchema.parse(axios.create());
 * PinoInstanceSchema.parse(pino());
 * ```
 */
export { AxiosInstanceSchema } from './isAxiosInstance';
export { PinoInstanceSchema } from './isPinoLogger';
