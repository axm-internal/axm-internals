import type { Kysely } from 'kysely';
import type { Database } from './types';

export const createSchema = async (db: Kysely<Database>): Promise<void> => {
    await db.schema
        .createTable('authors')
        .ifNotExists()
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('email', 'text', (col) => col.notNull().unique())
        .execute();

    await db.schema
        .createTable('commits')
        .ifNotExists()
        .addColumn('hash', 'text', (col) => col.primaryKey())
        .addColumn('author_id', 'text', (col) => col.notNull().references('authors.id').onDelete('restrict'))
        .addColumn('date', 'text', (col) => col.notNull())
        .addColumn('message', 'text', (col) => col.notNull())
        .addColumn('body', 'text', (col) => col.notNull())
        .addColumn('refs', 'text')
        .addColumn('type', 'text')
        .addColumn('scope', 'text')
        .addColumn('is_breaking_change', 'integer')
        .execute();

    await db.schema
        .createTable('commit_files')
        .ifNotExists()
        .addColumn('hash', 'text', (col) => col.notNull().references('commits.hash').onDelete('cascade'))
        .addColumn('path', 'text', (col) => col.notNull())
        .addColumn('status', 'text', (col) => col.notNull())
        .addPrimaryKeyConstraint('commit_files_pk', ['hash', 'path'])
        .execute();

    await db.schema.createIndex('authors_email_idx').ifNotExists().on('authors').column('email').execute();
    await db.schema.createIndex('commits_date_idx').ifNotExists().on('commits').column('date').execute();
    await db.schema.createIndex('commits_message_idx').ifNotExists().on('commits').column('message').execute();
    await db.schema.createIndex('commits_type_idx').ifNotExists().on('commits').column('type').execute();
    await db.schema.createIndex('commits_scope_idx').ifNotExists().on('commits').column('scope').execute();
    await db.schema.createIndex('commit_files_path_idx').ifNotExists().on('commit_files').column('path').execute();
    await db.schema.createIndex('commit_files_hash_idx').ifNotExists().on('commit_files').column('hash').execute();

    await db.schema
        .createTable('meta')
        .ifNotExists()
        .addColumn('key', 'text', (col) => col.primaryKey())
        .addColumn('value', 'text', (col) => col.notNull())
        .execute();
};
