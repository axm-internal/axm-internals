import { describe, expect, it } from 'bun:test';

import { changelogReportCommand } from '../../../../src/commands/changelog/reportCommand';
import { ChangelogBuilder } from '../../../../src/services/ChangelogBuilder';
import { InteractiveOutputService } from '../../../../src/services/InteractiveOutputService';
import { PackageInfoService } from '../../../../src/services/PackageInfoService';

class FakeContainer {
    private registry = new Map<unknown, unknown>();

    register(token: unknown, value: unknown) {
        this.registry.set(token, value);
    }

    resolve<T>(token: unknown): T {
        const value = this.registry.get(token);
        if (!value) {
            throw new Error('Missing token');
        }
        return value as T;
    }
}

describe('changelog:report command', () => {
    it('throws when packagePath is missing and --all is not provided', async () => {
        const container = new FakeContainer();
        container.register(InteractiveOutputService, { logType: () => {} });
        container.register(ChangelogBuilder, { report: async () => ({}) });
        container.register(PackageInfoService, { indexDb: async () => {} });

        await expect(
            changelogReportCommand.action({
                container: container as unknown as FakeContainer,
                args: { packagePath: undefined },
                options: { all: undefined },
            })
        ).rejects.toThrow('Package path is required unless --all is provided.');
    });

    it('indexes db and reports', async () => {
        const outputCalls: Array<{ message: string; obj?: unknown }> = [];
        const builderCalls: Array<string[]> = [];
        let indexed = 0;

        const container = new FakeContainer();
        container.register(InteractiveOutputService, {
            logType: ({ message, obj }: { message: string; obj?: unknown }) => {
                outputCalls.push({ message, obj });
            },
        });
        container.register(ChangelogBuilder, {
            report: async (targets: string[]) => {
                builderCalls.push(targets);
                return { total: 1, needsBackfill: 0, ok: 1, items: [] };
            },
        });
        container.register(PackageInfoService, {
            indexDb: async () => {
                indexed += 1;
            },
        });

        await changelogReportCommand.action({
            container: container as unknown as FakeContainer,
            args: { packagePath: 'packages/cli-kit' },
            options: { all: undefined },
        });

        expect(indexed).toBe(1);
        expect(builderCalls[0]).toEqual(['packages/cli-kit']);
        expect(outputCalls[0]?.message).toBe('Changelog report');
    });
});
