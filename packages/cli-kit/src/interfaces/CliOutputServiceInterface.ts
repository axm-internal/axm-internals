/**
 * Abstraction for emitting CLI output.
 *
 * @remarks
 * Implementations can route output to stdout/stderr with optional styling.
 * @example
 * ```ts
 * const output: CliOutputServiceInterface = new CliOutputService();
 * output.log('Ready');
 * ```
 */
export interface CliOutputServiceInterface {
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
    log(message: string): void;

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
    logSuccess(message: string): void;

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
    logError(message: string): void;
}
