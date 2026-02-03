/**
 * Join a route prefix and path into a normalized path.
 *
 * @param prefix - Optional base prefix such as `/api`.
 * @param path - Route path segment to append.
 * @returns The normalized path string.
 * @remarks
 * This helper trims duplicate slashes and ensures a leading slash for the path segment.
 * @example
 * ```ts
 * const fullPath = joinPaths('/api', 'health');
 * // => "/api/health"
 * ```
 */
export const joinPaths = (prefix: string | undefined, path: string): string => {
    if (!prefix) {
        return path;
    }

    const normalizedPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (!normalizedPrefix) {
        return normalizedPath || '/';
    }

    return `${normalizedPrefix}${normalizedPath}`;
};
