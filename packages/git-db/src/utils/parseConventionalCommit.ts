export type ConventionalCommitInfo = {
    type: string | null;
    scope: string | null;
    isBreakingChange: boolean | null;
};

const CONVENTIONAL_COMMIT_REGEX = /^([a-zA-Z][a-zA-Z0-9-]*)(?:\(([^)]+)\))?(!)?:\s/;

export const parseConventionalCommit = (message: string): ConventionalCommitInfo => {
    const match = message.match(CONVENTIONAL_COMMIT_REGEX);
    if (!match) {
        return { type: null, scope: null, isBreakingChange: null };
    }

    const [, type, scope, bang] = match;
    return {
        type: type ? type.toLowerCase() : null,
        scope: scope ? scope.toLowerCase() : null,
        isBreakingChange: Boolean(bang),
    };
};
