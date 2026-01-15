import chalk from 'chalk';
import type { CliOutputServiceInterface } from '../interfaces/CliOutputServiceInterface';

/**
 * Lightweight console output helper for CLI apps.
 *
 * @remarks
 * This service wraps stdout/stderr and process exits without external side effects beyond logging.
 */
export class CliOutputService implements CliOutputServiceInterface {
    /**
     * Log a plain message to stdout.
     *
     * @param message - The message to print.
     * @returns Nothing.
     * @remarks
     * Use for standard, non-styled output.
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
     */
    logError(message: string): void {
        console.error(message);
    }
}
