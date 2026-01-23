import type { Author, Commit, CommitFile, MetaEntry } from '../db/types';
import { buildCliTable } from './buildCliTable';
import { truncateString } from './truncateString';

export const renderJson = <T>(objs: T[]): string => JSON.stringify(objs, null, 2);

export const renderAuthors = (objs: Author[]): string =>
    buildCliTable({
        objs,
        columns: {
            Identifier: 'id',
            Name: 'name',
            Email: (row) => row.email.toLowerCase(),
        },
    }).toString();

export const renderCommits = (objs: Commit[]): string =>
    buildCliTable({
        objs,
        columns: {
            Hash: (row) => truncateString(row.hash, 16),
            Author: 'author_id',
            Type: (row) => row.type ?? '',
            Scope: (row) => row.scope ?? '',
            Breaking: (row) => (row.is_breaking_change === null ? '' : row.is_breaking_change ? 'yes' : 'no'),
            Message: (row) => truncateString(row.message),
            Date: (row) => row.date.toString(),
        },
    }).toString();

export const renderFiles = (objs: CommitFile[]): string =>
    buildCliTable({
        objs,
        columns: {
            Hash: (row) => truncateString(row.hash, 16),
            Status: 'status',
            Path: 'path',
        },
    }).toString();

export const renderMeta = (objs: MetaEntry[]): string =>
    buildCliTable({
        objs,
        columns: {
            Key: 'key',
            Value: (row) => truncateString(row.value, 80),
        },
    }).toString();
