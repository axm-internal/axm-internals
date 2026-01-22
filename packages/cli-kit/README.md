# @axm-internal/cli-kit

Shared helper utilities for building CLI applications with Commander

## Install

```bash
bun add @axm-internal/cli-kit
```

## Usage

### Commander.js (baseline)

```ts
import { Command } from 'commander';

const program = new Command();

program
  .command('hello')
  .description('says hello')
  .argument('<name>', 'person to greet', 'World')
  .option('-d, --debug', 'enable debug')
  .action((name, options) => {
    if (options.debug) {
      console.debug({ name });
    }
    console.log(`Hello ${name}!`);
  });

await program.parseAsync(process.argv);
```

### cli-kit (typed + validated)

```ts
import { z } from 'zod';
import { CliApp, CliLogger, createCommandDefinition } from '@axm-internal/cli-kit';

const helloCommand = createCommandDefinition({
  name: 'hello',
  description: 'says hello',
  argsSchema: z.object({
    name: z
      .string()
      .meta({ description: 'person to greet', position: 1 })
      .default('World'),
  }),
  optionsSchema: z.object({
    debug: z.boolean().meta({ description: 'enable debug', aliases: ['d'] }).optional(),
  }),
  action: async ({ args, options, container }) => {
    const { name } = args;
    const logger = container.resolve(CliLogger);

    if (options.debug) {
      logger.debug({ name }, 'arguments received');
    }

    console.log(`Hello ${name}!`);
  },
});

const app = new CliApp({
  config: { name: 'my-cli', description: 'Example CLI' },
  options: { commandDefinitions: [helloCommand] },
});

const exitCode = await app.start();
process.exit(exitCode);
```

## Highlights

- Thin wrapper around Commander with typed command definitions.
- Zod schemas validate arguments and options before action runs.
- Argument order can be defined via `meta.position` (or `argPositions`) alongside `argsSchema`.
- Option aliases can be defined via `meta.aliases`.
- Optional lightweight container for dependency resolution.
- Hooks (`onError`, `onExit`) and `getLastError()` for test-friendly flows.

## Notes

- Source-first, buildless package (Bun).
- Entry point: `src/index.ts`.
- Positional arguments are strings by default; use `z.coerce.*` when you need numeric or boolean args.
- Avoid Zod function defaults for CLI arguments/options; Commander treats functions as parsers.

## Breaking Changes

- Defaults are no longer inferred from `schema.default(...)` unless you also provide `meta({ defaultValue })`. Use `schema.meta({ defaultValue })` to keep Commander defaults and help text in sync.

## Docs

Generated documentation lives in `docs/` and can be updated with:

```bash
bun run docs
```
