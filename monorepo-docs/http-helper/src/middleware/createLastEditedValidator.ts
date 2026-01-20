import type { MiddlewareHandler } from 'hono';

import objectHash = require('object-hash');

type LastEditedRepo = {
    getLastModifiedAt: () => Promise<Date | null>;
};

export type LastEditedSource = {
    repo: LastEditedRepo;
    description?: string;
};

export type LastEditedValidatorOptions = {
    sources: [LastEditedSource, ...LastEditedSource[]];
    cacheControlHeader?: string | null;
    includeHead?: boolean;
    memoizeMs?: number;
};

const normalizeQueryParams = (url: string): Record<string, string[]> => {
    try {
        const parsed = new URL(url);
        const aggregated: Record<string, string[]> = {};
        for (const [key, value] of parsed.searchParams.entries()) {
            if (!aggregated[key]) {
                aggregated[key] = [];
            }
            aggregated[key].push(value);
        }

        return Object.keys(aggregated)
            .sort()
            .reduce<Record<string, string[]>>((acc, key) => {
                const values = aggregated[key] ?? [];
                acc[key] = [...values].sort();
                return acc;
            }, {});
    } catch {
        return {};
    }
};

const etagMatches = (headerValue: string | null, etag: string): boolean => {
    if (!headerValue) {
        return false;
    }

    return headerValue
        .split(',')
        .map((value) => value.trim())
        .some((candidate) => candidate === '*' || candidate === etag);
};

const truncatedEpochSeconds = (timestamp: number): number => Math.floor(timestamp / 1000);

const modifiedSinceMatches = (headerValue: string | null, lastModified: Date): boolean => {
    if (!headerValue) {
        return false;
    }

    const parsed = Date.parse(headerValue);
    if (Number.isNaN(parsed)) {
        return false;
    }

    const headerEpoch = truncatedEpochSeconds(parsed);
    const lastModifiedEpoch = truncatedEpochSeconds(lastModified.getTime());
    return headerEpoch >= lastModifiedEpoch;
};

export const createLastEditedValidator = ({
    sources,
    cacheControlHeader = 'private, max-age=0, must-revalidate',
    includeHead = false,
    memoizeMs = 500,
}: LastEditedValidatorOptions): MiddlewareHandler => {
    if (!sources?.length) {
        throw new Error('createLastEditedValidator requires at least one data source.');
    }

    type CacheEntry = { value: Date | null; expiresAt: number };
    let cacheEntry: CacheEntry | null = null;

    const resolveLastModified = async (): Promise<Date | null> => {
        const now = Date.now();
        if (memoizeMs > 0 && cacheEntry && cacheEntry.expiresAt > now) {
            return cacheEntry.value;
        }

        const timestamps = await Promise.all(
            sources.map(async ({ repo, description }) => {
                try {
                    return await repo.getLastModifiedAt();
                } catch (error) {
                    throw new Error(
                        `Failed to resolve last modified timestamp for ${description ?? 'repository source'}`,
                        { cause: error }
                    );
                }
            })
        );

        const latest = timestamps.reduce<Date | null>((current, candidate) => {
            if (!candidate) {
                return current;
            }

            if (!current || candidate.getTime() > current.getTime()) {
                return candidate;
            }

            return current;
        }, null);

        if (memoizeMs > 0) {
            cacheEntry = {
                value: latest,
                expiresAt: now + memoizeMs,
            };
        }

        return latest;
    };

    const shouldHandle = (method: string): boolean => method === 'GET' || (includeHead && method === 'HEAD');

    return async (c, next) => {
        if (!shouldHandle(c.req.method)) {
            await next();
            return;
        }

        const lastModified = await resolveLastModified();
        if (!lastModified) {
            await next();
            return;
        }

        const normalizedQuery = normalizeQueryParams(c.req.url);
        const etagPayload = {
            path: c.req.path,
            query: normalizedQuery,
            lastModified: lastModified.toISOString(),
        };
        const etag = `W/"${objectHash(etagPayload)}"`;

        if (
            etagMatches(c.req.header('if-none-match') ?? null, etag) ||
            modifiedSinceMatches(c.req.header('if-modified-since') ?? null, lastModified)
        ) {
            c.header('ETag', etag);
            c.header('Last-Modified', lastModified.toUTCString());
            if (cacheControlHeader) {
                c.header('Cache-Control', cacheControlHeader);
            }
            return c.body(null, 304);
        }

        await next();

        c.header('ETag', etag);
        c.header('Last-Modified', lastModified.toUTCString());
        if (cacheControlHeader) {
            c.header('Cache-Control', cacheControlHeader);
        }
    };
};
