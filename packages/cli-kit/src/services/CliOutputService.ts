import chalk from 'chalk';
import type { CliOutputServiceInterface } from '../interfaces/CliOutputServiceInterface';

/**
 * Lightweight console output helper for CLI apps.
 *
 * @remarks
 * This service wraps stdout/stderr and process exits without external side effects beyond logging.
 * @example
 * ```ts
 * const output = new CliOutputService();
 * output.log('Ready');
 * ```
 */
export class CliOutputService implements CliOutputServiceInterface {
    /**
     * Log a plain message to stdout.
     *
     * @param message - The message to print.
     * @returns Nothing.
     * @remarks
     * Use for standard, non-styled output.
     * @example
     * ```ts
     * output.log('Starting...');
     * ```
     */
    log(message: string): void {
        console.log(message);
    }

    /**
     * Log a success message to stdout with green formatting.
     *
     * @param message - The success message to print.
     * @returns Nothing.
     * @remarks
     * Uses `chalk.green` to format the message.
     * @example
     * ```ts
     * output.logSuccess('Done');
     * ```
     */
    logSuccess(message: string): void {
        console.log(chalk.green(message));
    }

    /**
     * Log an error message to stderr.
     *
     * @param message - The error message to print.
     * @returns Nothing.
     * @remarks
     * Prefer this for error output to keep stderr separated.
     * @example
     * ```ts
     * output.logError('Failed');
     * ```
     */
    logError(message: string): void {
        console.error(message);
    }
}
