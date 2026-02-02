import type { z } from 'zod';

import type { ValidationErrorItem } from '../errors/responseEnvelopes';
import { ValidationError } from '../errors/ValidationError';

export type ValidationSource = 'params' | 'query' | 'headers' | 'body' | 'response';

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

export const mapZodIssues = (source: ValidationSource, issues: z.core.$ZodIssue[]): ValidationErrorItem[] =>
    issues.map((issue) => ({
        path: formatValidationPath(source, issue.path),
        message: issue.message,
    }));

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
