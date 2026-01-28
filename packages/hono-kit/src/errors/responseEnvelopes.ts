export type ValidationErrorItem = {
    path: string;
    message: string;
};

export type SuccessEnvelope<T> = {
    status: 'success';
    requestId: string;
    data: T | null;
};

export type ErrorEnvelope = {
    status: 'error';
    requestId: string;
    statusCode: number;
    errorCode?: string;
    errorMessage: string;
    validationErrors?: ValidationErrorItem[];
    errorStack?: string;
};

export const successEnvelope = <T>(params: { requestId: string; data: T | null }): SuccessEnvelope<T> => ({
    status: 'success',
    requestId: params.requestId,
    data: params.data,
});

export const errorEnvelope = (params: {
    requestId: string;
    statusCode: number;
    errorMessage: string;
    errorCode?: string;
    validationErrors?: ValidationErrorItem[];
    errorStack?: string;
}): ErrorEnvelope => ({
    status: 'error',
    requestId: params.requestId,
    statusCode: params.statusCode,
    errorCode: params.errorCode,
    errorMessage: params.errorMessage,
    validationErrors: params.validationErrors,
    errorStack: params.errorStack,
});
