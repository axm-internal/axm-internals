#!/usr/bin/env bun
import { CliApp } from '@axm-internal/cli-kit';
import pino from 'pino';
import { ZodError } from 'zod';
import { initCommand, queryCommand, updateCommand } from './commands';

const logger = pino();
logger.level = 'fatal';

const cliApp = new CliApp({
    config: {
        name: 'git-db',
        description: 'SQLite-backed git commit index.',
        version: process.env.npm_package_version ?? '0.1.0',
    },
    options: {
        logger: logger,
        pretty: true,
        commandDefinitions: [initCommand, updateCommand, queryCommand],
        onError: (error) => {
            if (error instanceof ZodError) {
                const zodError = error as ZodError;
                zodError.issues.forEach((issue) => {
                    console.error(issue.message);
                });
                return;
            } else {
                console.error(error.message);
            }
        },
    },
});
const exitCode = await cliApp.start();
process.exit(exitCode);
