#!/usr/bin/env bun
import { CliApp } from '@axm-internal/cli-kit';
import { ZodError } from 'zod';
import { appContainer, interactiveOutputService } from './appContainer';
import { publishCommands } from './commands/publish';
import { releaseCommands } from './commands/release';
import { tagCommands } from './commands/tag';
import { versionCommands } from './commands/version';

const cliApp = new CliApp({
    config: {
        name: 'release-cli',
        description: 'Version bumping, git tagging, npm publishing, and release orchestration.',
        version: '0.1.0',
    },
    options: {
        container: appContainer,
        pretty: true,
        logErrors: false,
        commandDefinitions: [...versionCommands, ...tagCommands, ...publishCommands, ...releaseCommands],
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
