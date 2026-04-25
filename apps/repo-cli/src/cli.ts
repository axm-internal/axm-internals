#!/usr/bin/env bun
import { CliApp } from '@axm-internal/cli-kit';
import { ZodError } from 'zod';
import { appContainer, interactiveOutputService } from './appContainer';
import { changelogCommands } from './commands/changelog';
import { gitDbCommands } from './commands/gitdb';
import { promptRunnerCommands } from './commands/prompt-runners';

const cliApp = new CliApp({
    config: {
        name: 'repo-cli',
        description: 'Run monorepo CLI workflows and automation tasks.',
        version: '0.2.0',
    },
    options: {
        container: appContainer,
        pretty: true,
        logErrors: false,
        commandDefinitions: [...promptRunnerCommands, ...gitDbCommands, ...changelogCommands],
        onError: (error) => {
            if (error instanceof ZodError) {
                error.issues.forEach((issue) => {
                    interactiveOutputService.logType({
                        type: 'error',
                        message: issue.message,
                    });
                });
                return;
            } else {
                interactiveOutputService.logType({
                    type: 'error',
                    message: error.message,
                });
            }
        },
    },
});

const exitCode = await cliApp.start();
process.exit(exitCode);
