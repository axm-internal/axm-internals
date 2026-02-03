import { HTTPException } from 'hono/http-exception';

import type { ValidationErrorItem } from '../errors/responseEnvelopes';

/**
 * HTTP exception representing validation failures.
 *
 * @remarks
 * Carries a list of validation errors in the `cause` and on the instance.
 * @example
 * ```ts
 * throw new ValidationError({
 *   validationErrors: [{ path: 'body.email', message: 'Invalid email' }],
 * });
 * ```
 */
export class ValidationError extends HTTPException {
    /**
     * Validation details for the error.
     *
     * @remarks
     * This mirrors the `validationErrors` data passed to the constructor.
     * @example
     * ```ts
     * error.validationErrors.forEach((item) => console.log(item.path));
     * ```
     */
    readonly validationErrors: ValidationErrorItem[];

    /**
     * Create a validation error with one or more validation issues.
     *
     * @param params - Error message and validation details.
     * @remarks
     * Defaults the message to `Validation failed` and sets the HTTP status to 400.
     * @example
     * ```ts
     * const error = new ValidationError({
     *   message: 'Invalid input',
     *   validationErrors: [{ path: 'body.id', message: 'Required' }],
     * });
     * ```
     */
    constructor(params: { message?: string; validationErrors: ValidationErrorItem[] }) {
        super(400, { message: params.message ?? 'Validation failed', cause: params });
        this.validationErrors = params.validationErrors;
    }

    /**
     * Serialize validation details for JSON responses.
     *
     * @returns A JSON-safe object containing the validation errors.
     * @remarks
     * This is useful when constructing error envelopes.
     * @example
     * ```ts
     * const payload = error.toJSON();
     * ```
     */
    toJSON(): { validationErrors: ValidationErrorItem[] } {
        return { validationErrors: this.validationErrors };
    }
}
