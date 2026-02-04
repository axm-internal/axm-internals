import type { NullablePragmas, Pragmas } from '../../types';

type ResolvePragmasParams = {
    preset?: Pragmas;
    userDefined?: NullablePragmas;
    usePragmaPreset?: boolean;
};

export const resolvePragmas = ({
    usePragmaPreset = false,
    userDefined = {},
    preset = {},
}: ResolvePragmasParams): Pragmas => {
    const source = usePragmaPreset ? { ...preset, ...userDefined } : { ...userDefined };
    const resolved: Pragmas = {};

    for (const [key, value] of Object.entries(source)) {
        if (value !== null) {
            resolved[key] = value;
        }
    }

    return resolved;
};
