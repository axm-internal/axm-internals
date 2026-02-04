import { z } from 'zod';
import { makeAutoIncrement, makePrimaryKey } from '../../src/schema/meta';
import type { ModelFixture } from './types';

const schema = z.object({
    id: makeAutoIncrement(makePrimaryKey(z.number().int())),
    name: z.string(),
});

export const userModelFixture: ModelFixture<typeof schema> = {
    modelConfig: {
        table: 'users',
        schema,
    },
    rows: [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Cleo' },
    ],
};
