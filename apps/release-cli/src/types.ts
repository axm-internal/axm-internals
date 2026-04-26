export type PackageGuardResult = {
    packageName: string;
    packageFullPath: string;
};

export type BumpLevel = 'patch' | 'minor' | 'major';

export type VersionBumpResult = {
    packagePath: string;
    previousVersion: string;
    newVersion: string;
};

export type CascadeBumpResult = {
    primary: VersionBumpResult;
    cascaded: VersionBumpResult[];
};

export type TagResult = {
    tag: string;
    packagePath: string;
    version: string;
    pushed: boolean;
};

export type PublishResult = {
    packagePath: string;
    version: string;
    distTag: string;
    published: boolean;
};

export type ReleaseStep = 'index' | 'changelog-update' | 'changelog-write' | 'version' | 'tag' | 'commit' | 'publish';

export type ReleaseResult = {
    packagePath: string;
    bump: BumpLevel;
    steps: Array<{ step: ReleaseStep; status: 'skipped' | 'success' | 'dry-run' }>;
    version: string;
};
