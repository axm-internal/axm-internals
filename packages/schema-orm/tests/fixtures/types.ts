import type { z } from 'zod';

export type ModelFixture<TSchema extends z.ZodObject> = {
    modelConfig: {
        table: string;
        schema: TSchema;
    };
    rows: Array<z.input<TSchema>>;
};
