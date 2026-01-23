import { describe, expect, it } from 'bun:test';
import { parseConventionalCommit } from '../../../src/utils/parseConventionalCommit';

describe('parseConventionalCommit', () => {
    it('returns nulls when the message is not conventional', () => {
        expect(parseConventionalCommit('update readme')).toEqual({
            type: null,
            scope: null,
            isBreakingChange: null,
        });
    });

    it('parses type without scope', () => {
        expect(parseConventionalCommit('feat: add feature')).toEqual({
            type: 'feat',
            scope: null,
            isBreakingChange: false,
        });
    });

    it('parses type and scope', () => {
        expect(parseConventionalCommit('fix(cli-kit): adjust parsing')).toEqual({
            type: 'fix',
            scope: 'cli-kit',
            isBreakingChange: false,
        });
    });

    it('parses breaking change markers', () => {
        expect(parseConventionalCommit('feat(repo)!: restructure')).toEqual({
            type: 'feat',
            scope: 'repo',
            isBreakingChange: true,
        });
    });
});
