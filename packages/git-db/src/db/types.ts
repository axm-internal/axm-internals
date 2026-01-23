import type { Insertable, Selectable, Updateable } from 'kysely';

export interface Database {
    authors: AuthorsTable;
    commits: CommitsTable;
    commit_files: CommitFilesTable;
    meta: MetaTable;
}

export interface AuthorsTable {
    id: string;
    name: string;
    email: string;
}

export interface CommitsTable {
    hash: string;
    author_id: string;
    date: string;
    message: string;
    body: string;
    refs: string | null;
    type: string | null;
    scope: string | null;
    is_breaking_change: boolean | null;
}

export interface CommitFilesTable {
    hash: string;
    path: string;
    status: string;
}

export interface MetaTable {
    key: string;
    value: string;
}

export type Author = Selectable<AuthorsTable>;
export type NewAuthor = Insertable<AuthorsTable>;
export type AuthorUpdate = Updateable<AuthorsTable>;

export type Commit = Selectable<CommitsTable>;
export type NewCommit = Insertable<CommitsTable>;
export type CommitUpdate = Updateable<CommitsTable>;

export type CommitFile = Selectable<CommitFilesTable>;
export type NewCommitFile = Insertable<CommitFilesTable>;
export type CommitFileUpdate = Updateable<CommitFilesTable>;

export type MetaEntry = Selectable<MetaTable>;
export type NewMetaEntry = Insertable<MetaTable>;
export type MetaEntryUpdate = Updateable<MetaTable>;
