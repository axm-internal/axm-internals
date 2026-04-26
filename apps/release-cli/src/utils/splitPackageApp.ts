export const splitPackageApp = (packageApp?: string): [string, string] => {
    if (!packageApp) {
        throw new Error('Package or app name is required');
    }

    const [type, name] = packageApp.split('/', 2);

    if (!type || !name) {
        throw new Error('Invalid package or app name.');
    }

    return [type, name];
};
