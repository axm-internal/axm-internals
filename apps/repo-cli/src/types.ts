export type TemplateName = 'checklist' | 'llms' | 'typedoc';

export type InstructionParams = {
    packagePath: string;
};

export type PackageGuardResult = {
    packageName: string;
    packageFullPath: string;
};
