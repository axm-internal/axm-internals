import { HTTPException } from 'hono/http-exception';

import type { ValidationErrorItem } from '../errors/responseEnvelopes';

export class ValidationError extends HTTPException {
    readonly validationErrors: ValidationErrorItem[];

    constructor(params: { message?: string; validationErrors: ValidationErrorItem[] }) {
        super(400, { message: params.message ?? 'Validation failed', cause: params });
        this.validationErrors = params.validationErrors;
    }

    toJSON(): { validationErrors: ValidationErrorItem[] } {
        return { validationErrors: this.validationErrors };
    }
}
