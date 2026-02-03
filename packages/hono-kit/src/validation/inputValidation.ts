import type { z } from 'zod';

import type { ValidationErrorItem } from '../errors/responseEnvelopes';
import { ValidationError } from '../errors/ValidationError';

/**
 * Input sources used for validation error paths.
 *
 * @remarks
 * Includes request and response sources.
 * @example
 * ```ts
 * const source: ValidationSource = 'query';
 * ```
 */
export type ValidationSource = 'params' | 'query' | 'headers' | 'body' | 'response';

/**
 * Format a validation path for error reporting.
 *
 * @param source - The validation source.
 * @param path - Zod issue path segments.
 * @returns A dot/bracket notation path string.
 * @remarks
 * Numeric segments are rendered as array indices.
 * @example
 * ```ts
 * const path = formatValidationPath('body', ['user', 0, 'email']);
 * // => "body.user[0].email"
 * ```
 */
export const formatValidationPath = (source: ValidationSource, path: Array<PropertyKey>): string => {
    const parts: string[] = [source];

    for (const segment of path) {
        if (typeof segment === 'number') {
            parts[parts.length - 1] = `${parts[parts.length - 1]}[${segment}]`;
            continue;
        }

        parts.push(String(segment));
    }

    return parts.join('.');
};

/**
 * @internal
 * Map Zod issues to validation error items.
 *
 * @param source - The validation source.
 * @param issues - Zod issues to map.
 * @returns Validation error items for reporting.
 * @remarks
 * Each item includes a formatted path and message.
 */
export const mapZodIssues = (source: ValidationSource, issues: z.core.$ZodIssue[]): ValidationErrorItem[] =>
    issues.map((issue) => ({
        path: formatValidationPath(source, issue.path),
        message: issue.message,
    }));

/**
 * Validate an input value with a Zod schema.
 *
 * @param params - Validation configuration and input value.
 * @returns Parsed data when validation succeeds.
 * @remarks
 * Throws a `ValidationError` when validation fails.
 * @example
 * ```ts
 * const data = validateInput({ source: 'body', schema: z.object({ id: z.string() }), value: payload });
 * ```
 */
export const validateInput = <T>(params: {
    source: ValidationSource;
    schema: z.ZodType<T>;
    value: unknown;
    message?: string;
}): T => {
    const result = params.schema.safeParse(params.value);

    if (result.success) {
        return result.data;
    }

    const validationErrors = mapZodIssues(params.source, result.error.issues);
    throw new ValidationError({
        message: params.message ?? 'Validation failed',
        validationErrors,
    });
};
