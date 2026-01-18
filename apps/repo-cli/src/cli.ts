#!/usr/bin/env bun
import { CliApp } from '@axm-internal/cli-kit';
import { checklistCommand } from './commands/checklistCommand';
import { llmsCommand } from './commands/llmsCommand';
import { typedocCommand } from './commands/typedocCommand';

const cliApp = new CliApp({
    config: {
        name: 'repo-cli',
        description: 'Run Codex prompt runners for this monorepo.',
        version: '0.2.0',
    },
    options: {
        pretty: true,
        commandDefinitions: [checklistCommand, llmsCommand, typedocCommand],
    },
});
const exitCode = await cliApp.start();
process.exit(exitCode);
