import type { z } from 'zod';

import type { ValidationErrorItem } from '../errors/responseEnvelopes';
import { ValidationError } from '../errors/ValidationError';
import { formatValidationPath } from './inputValidation';

export const validateResponseData = <T>(params: { schema: z.ZodType<T>; data: unknown; message?: string }): T => {
    const result = params.schema.safeParse(params.data);

    if (result.success) {
        return result.data;
    }

    const validationErrors: ValidationErrorItem[] = result.error.issues.map((issue) => ({
        path: formatValidationPath('response', issue.path),
        message: issue.message,
    }));

    throw new ValidationError({
        message: params.message ?? 'Response validation failed',
        validationErrors,
    });
};
