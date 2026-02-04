import { describe, expect, it } from 'bun:test';
import { resolvePragmas } from '../../../../src/db/adapters/resolvePragmas';

describe('resolvePragmas', () => {
    it('returns userDefined when preset is disabled', () => {
        const result = resolvePragmas({
            usePragmaPreset: false,
            userDefined: {
                journal_mode: 'WAL',
                synchronous: 'NORMAL',
            },
        });

        expect(result).toEqual({
            journal_mode: 'WAL',
            synchronous: 'NORMAL',
        });
    });

    it('merges preset and userDefined when preset is enabled', () => {
        const result = resolvePragmas({
            usePragmaPreset: true,
            preset: {
                journal_mode: 'WAL',
                synchronous: 'NORMAL',
                busy_timeout: 5000,
            },
            userDefined: {
                synchronous: 'FULL',
            },
        });

        expect(result).toEqual({
            journal_mode: 'WAL',
            synchronous: 'FULL',
            busy_timeout: 5000,
        });
    });

    it('drops null overrides', () => {
        const result = resolvePragmas({
            usePragmaPreset: true,
            preset: {
                journal_mode: 'WAL',
                synchronous: 'NORMAL',
            },
            userDefined: {
                synchronous: null,
            },
        });

        expect(result).toEqual({
            journal_mode: 'WAL',
        });
    });
});
