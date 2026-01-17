import { Command } from 'commander';
import pino, { type Logger } from 'pino';
import pinoPretty from 'pino-pretty';
import { CliLogger } from './constants';
import { InMemoryContainer } from './containers/InMemoryContainer';
import type { ContainerInterface } from './interfaces/ContainerInterface';
import { registerCommandDefinition } from './registerCommandDefinition';
import { type CliAppParams, CliAppParamsSchema, type CliConfig } from './schemas/CliAppSchemas';
import type { CommandDefinition } from './schemas/CommandDefinitionSchemaFactory';

/**
 * Orchestrates CLI configuration, commands, and lifecycle hooks.
 *
 * @remarks
 * Manages command registration and delegates execution to Commander.js.
 * @example
 * ```ts
 * const app = new CliApp({ config: { name: 'my-cli' }, options: {} });
 * await app.start();
 * ```
 */
export class CliApp {
    protected program: Command;
    protected config: CliConfig;
    protected container: ContainerInterface;
    protected commandDefinitions: CommandDefinition[];
    protected logger: Logger;
    protected initialized = false;
    protected lastError?: Error;
    protected onError?: (error: Error) => void;
    protected onExit?: (code: number, error?: Error) => void;

    /**
     * Create a new CLI app instance.
     *
     * @param params - App configuration and options.
     * @returns Nothing.
     * @remarks
     * Validates input with Zod and registers a logger in the container.
     * @example
     * ```ts
     * const app = new CliApp({ config: { name: 'my-cli' }, options: {} });
     * ```
     */
    constructor(params: CliAppParams) {
        const { config, options } = CliAppParamsSchema.parse(params);
        const { commandDefinitions = [], container, logger, loggerAliases, pretty = true, onError, onExit } = options;

        this.config = config;
        this.commandDefinitions = commandDefinitions;
        this.container = container ?? new InMemoryContainer();
        this.logger = this.createLogger(config.name, pretty, logger);
        this.onError = onError;
        this.onExit = onExit;
        const tokens = [CliLogger, ...(loggerAliases ?? [])];
        for (const token of tokens) {
            this.container.registerInstance(token, this.logger);
        }
        this.program = new Command();
    }

    protected createLogger(appName: string, pretty: boolean, baseLogger?: Logger): Logger {
        const logger = baseLogger ?? pino(pretty ? pinoPretty() : undefined);
        return logger.child({ module: appName });
    }

    /**
     * Access the underlying Commander program instance.
     *
     * @returns The Commander program.
     * @remarks
     * Use this to add custom Commander configuration.
     * @example
     * ```ts
     * const program = app.getProgram();
     * program.showHelpAfterError();
     * ```
     */
    getProgram(): Command {
        return this.program;
    }

    /**
     * Get the last error captured during execution.
     *
     * @returns The last error, or undefined if none.
     * @remarks
     * This value is set after `start` returns.
     * @example
     * ```ts
     * const lastError = app.getLastError();
     * ```
     */
    getLastError(): Error | undefined {
        return this.lastError;
    }

    /**
     * Clear the stored last error.
     *
     * @returns Nothing.
     * @remarks
     * Use before a new run if you track errors between runs.
     * @example
     * ```ts
     * app.clearLastError();
     * ```
     */
    clearLastError(): void {
        this.lastError = undefined;
    }

    /**
     * Replace the command definitions for the app.
     *
     * @param commandDefinitions - The new command list.
     * @returns Nothing.
     * @remarks
     * Existing definitions are overwritten.
     * @example
     * ```ts
     * app.setCommands([definition]);
     * ```
     */
    setCommands(commandDefinitions: CommandDefinition[]) {
        this.commandDefinitions = commandDefinitions;
    }

    /**
     * Add a command definition to the app.
     *
     * @param commandDefinition - The command to add.
     * @returns Nothing.
     * @remarks
     * Appends to the existing command list.
     * @example
     * ```ts
     * app.addCommand(definition);
     * ```
     */
    addCommand(commandDefinition: CommandDefinition) {
        this.commandDefinitions.push(commandDefinition);
    }

    protected registerCommand(commandDefinition: CommandDefinition) {
        registerCommandDefinition({
            program: this.program,
            definition: commandDefinition,
            container: this.container,
        });
    }

    protected init() {
        this.program.name(this.config.name).option('-d, --debug', 'output extra debugging information');

        if (this.config.description) {
            this.program.description(this.config.description);
        }

        if (this.config.version) {
            this.program.version(this.config.version);
        }

        this.program.hook('preAction', () => {
            if (this.program.opts().debug) {
                this.container.resolve(CliLogger).level = 'debug';
            }
        });

        for (const command of this.commandDefinitions) {
            this.registerCommand(command);
        }

        // Error handling
        this.program.exitOverride();
        this.initialized = true;
    }

    /**
     * Initialize and run the CLI.
     *
     * @returns The process exit code.
     * @remarks
     * Returns 0 on success and 1 on command errors.
     * @example
     * ```ts
     * const code = await app.start();
     * process.exit(code);
     * ```
     */
    async start(): Promise<number> {
        if (!this.initialized) {
            this.init();
        }

        try {
            await this.program.parseAsync(process.argv);
            this.lastError = undefined;
            this.onExit?.(0);
            return 0;
        } catch (error: unknown) {
            // Resolve logger here, after parseAsync/preAction has run
            const logger = this.container.resolve(CliLogger);
            const normalizedError = error instanceof Error ? error : new Error(String(error));

            if (error instanceof Error && 'code' in error) {
                if (error.code === 'commander.help' || error.code === 'commander.helpDisplayed') {
                    this.lastError = undefined;
                    this.onExit?.(0, normalizedError);
                    return 0;
                }
                if (error.code === 'commander.version') {
                    this.lastError = undefined;
                    this.onExit?.(0, normalizedError);
                    return 0;
                }
                if (String(error.code).startsWith('commander.')) {
                    this.lastError = normalizedError;
                    this.onError?.(normalizedError);
                    this.onExit?.(1, normalizedError);
                    return 1;
                }
            }

            this.lastError = normalizedError;
            this.onError?.(normalizedError);
            logger.error(error, '❌ CLI Error:');
            this.onExit?.(1, normalizedError);
            return 1;
        }
    }
}
