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
