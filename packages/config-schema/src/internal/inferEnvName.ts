export const inferEnvName = (path: string[]): string =>
    path
        .join('_')
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .toUpperCase();
