import { z } from 'zod';
import { defineDatabase } from '../src/db/defineDatabase';
import { makeAutoIncrement, makeJson, makePrimaryKey } from '../src/schema/meta';

const db = defineDatabase({
    databasePath: ':memory:',
    modelDefinitions: {
        Users: {
            table: 'users',
            schema: z.object({
                id: makeAutoIncrement(makePrimaryKey(z.number().int())),
                name: z.string(),
                dob: z.date(),
                favorites: makeJson(
                    z.object({
                        color: z.string().optional(),
                        sport: z.string().optional(),
                    })
                ).optional(),
            }),
        },
    },
    hooks: {
        onFirstCreate: ({ models }) => {
            console.log('running onFirstCreate');
            models.Users.saveMany({
                data: [
                    { name: 'Angel', dob: new Date('1980-03-08'), favorites: { color: 'black' } },
                    { name: 'Autumn', dob: new Date('2004-07-09') },
                ],
            });
        },
    },
});

console.log({
    count: db.Users.count(),
    paginated: db.Users.findPaginated(),
    first: db.Users.findMany({
        limit: 1,
    }),
    firstFavColor: db.Users.findById({ id: 1 })?.favorites?.color,
    secondFavColor: db.Users.findById({ id: 2 })?.favorites?.color,
});
