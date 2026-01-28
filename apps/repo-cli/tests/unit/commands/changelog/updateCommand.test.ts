import { describe, expect, it } from 'bun:test';

import { changelogUpdateCommand } from '../../../../src/commands/changelog/updateCommand';
import { ChangelogBuilder } from '../../../../src/services/ChangelogBuilder';
import { InteractiveOutputService } from '../../../../src/services/InteractiveOutputService';

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

describe('changelog:update command', () => {
    it('throws when packagePath is missing and --all is not provided', async () => {
        const container = new FakeContainer();
        container.register(InteractiveOutputService, { logType: () => {} });
        container.register(ChangelogBuilder, {
            reportUpdate: async () => ({}),
            update: async () => ({}),
        });

        await expect(
            changelogUpdateCommand.action({
                container: container as unknown as FakeContainer,
                args: { packagePath: undefined },
                options: { all: undefined },
            })
        ).rejects.toThrow('Package path is required unless --all is provided.');
    });

    it('reports without applying when --dry is set', async () => {
        const outputCalls: Array<string> = [];
        let reportCalls = 0;
        let updateCalls = 0;

        const container = new FakeContainer();
        container.register(InteractiveOutputService, {
            logType: ({ message }: { message: string }) => {
                outputCalls.push(message);
            },
        });
        container.register(ChangelogBuilder, {
            reportUpdate: async () => {
                reportCalls += 1;
                return { total: 1, updated: 0, ok: 1, items: [] };
            },
            update: async () => {
                updateCalls += 1;
                return { total: 1, updated: 1, ok: 0, items: [] };
            },
        });

        await changelogUpdateCommand.action({
            container: container as unknown as FakeContainer,
            args: { packagePath: 'packages/cli-kit' },
            options: { all: undefined, dry: true },
        });

        expect(reportCalls).toBe(1);
        expect(updateCalls).toBe(0);
        expect(outputCalls[0]).toBe('Update report (preview)');
    });

    it('applies update when --dry is not set', async () => {
        const outputCalls: Array<string> = [];
        let reportCalls = 0;
        let updateCalls = 0;

        const container = new FakeContainer();
        container.register(InteractiveOutputService, {
            logType: ({ message }: { message: string }) => {
                outputCalls.push(message);
            },
        });
        container.register(ChangelogBuilder, {
            reportUpdate: async () => {
                reportCalls += 1;
                return { total: 1, updated: 1, ok: 0, items: [] };
            },
            update: async () => {
                updateCalls += 1;
                return { total: 1, updated: 1, ok: 0, items: [] };
            },
        });

        await changelogUpdateCommand.action({
            container: container as unknown as FakeContainer,
            args: { packagePath: 'packages/cli-kit' },
            options: { all: undefined, dry: undefined },
        });

        expect(reportCalls).toBe(1);
        expect(updateCalls).toBe(1);
        expect(outputCalls[0]).toBe('Update report');
        expect(outputCalls[1]).toBe('Update applied');
    });
});
