import { afterEach, describe, expect, it } from 'bun:test';
import chalk from 'chalk';
import { CliOutputService } from '../../../src/services/CliOutputService';

describe('CliOutputService', () => {
    const service = new CliOutputService();

    const originalLog = console.log;
    const originalError = console.error;
    const originalExit = process.exit;

    afterEach(() => {
        console.log = originalLog;
        console.error = originalError;
        process.exit = originalExit;
    });

    it('logs a plain message', () => {
        const calls: string[] = [];
        console.log = (message: string) => {
            calls.push(message);
        };

        service.log('hello');

        expect(calls).toEqual(['hello']);
    });

    it('logs a success message in green', () => {
        const calls: string[] = [];
        console.log = (message: string) => {
            calls.push(message);
        };

        service.logSuccess('ok');

        expect(calls).toEqual([chalk.green('ok')]);
    });

    it('logs an error message to stderr', () => {
        const calls: string[] = [];
        console.error = (message: string) => {
            calls.push(message);
        };

        service.logError('boom');

        expect(calls).toEqual(['boom']);
    });
});
