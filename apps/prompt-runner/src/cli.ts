#!/usr/bin/env bun
import { Command } from 'commander';
import { runChecklist, runLlms, runTypedoc } from './commands';

const program = new Command();

program.name('prompt-runners').description('Run Codex prompt runners for this monorepo.').version('0.1.0');

program
    .command('checklist')
    .description('Run the dev-complete checklist for a package and write checklist.md.')
    .argument('<package-path>', 'Package path (must start with packages/)')
    .action(async (packagePath: string) => {
        try {
            await runChecklist([packagePath]);
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program
    .command('llms')
    .description('Generate or refresh llms.txt for a package.')
    .argument('<package-path>', 'Package path (must start with packages/)')
    .action(async (packagePath: string) => {
        try {
            await runLlms([packagePath]);
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

program
    .command('typedoc')
    .description('Add or improve Typedoc/TSDoc docblocks for a package.')
    .argument('<package-path>', 'Package path (must start with packages/)')
    .action(async (packagePath: string) => {
        try {
            await runTypedoc([packagePath]);
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

await program.parseAsync(process.argv);
