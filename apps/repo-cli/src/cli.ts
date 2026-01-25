#!/usr/bin/env bun
import 'reflect-metadata';
import { CliApp } from '@axm-internal/cli-kit';
import { ZodError } from 'zod';
import { appContainer } from './appContainer';
import { changesetCommands } from './commands/changesets';
import { gitDbCommands } from './commands/gitdb';
import { promptRunnerCommands } from './commands/prompt-runners';
import { InteractiveOutputService } from './services/InteractiveOutputService';

const interactiveOutputService = appContainer.resolve(InteractiveOutputService);
const cliApp = new CliApp({
    config: {
        name: 'repo-cli',
        description: 'Run monorepo CLI workflows and automation tasks.',
        version: '0.2.0',
    },
    options: {
        container: appContainer,
        pretty: true,
        commandDefinitions: [...promptRunnerCommands, ...gitDbCommands, ...changesetCommands],
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
