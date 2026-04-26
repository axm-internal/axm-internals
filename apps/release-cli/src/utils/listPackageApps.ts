import { getValidPackageApps } from '../schemas/PackageAppSchema';

export const listPackageApps = (): string[] => {
    return getValidPackageApps();
};
