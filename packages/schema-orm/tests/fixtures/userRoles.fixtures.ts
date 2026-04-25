import { z } from 'zod';
import { makePrimaryKey } from '../../src/schema/meta';
import type { ModelFixture } from './types';

const schema = z.object({
    userId: makePrimaryKey(z.number().int()),
    roleId: makePrimaryKey(z.number().int()),
    grantedAt: z.string(),
});

export const userRolesFixture: ModelFixture<typeof schema> = {
    modelConfig: {
        table: 'user_roles',
        schema,
    },
    rows: [
        { userId: 1, roleId: 10, grantedAt: '2024-01-01' },
        { userId: 1, roleId: 20, grantedAt: '2024-01-02' },
        { userId: 2, roleId: 10, grantedAt: '2024-01-03' },
    ],
};
