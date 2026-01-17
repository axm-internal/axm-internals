import type { Logger } from 'pino';
import type { InjectionToken } from './interfaces/ContainerInterface';

/**
 * Injection token used to register and resolve the CLI logger instance.
 *
 * @remarks
 * Use this token with a container to share a logger across commands.
 * @example
 * ```ts
 * container.registerInstance(CliLogger, logger);
 * const resolved = container.resolve(CliLogger);
 * ```
 */
export const CliLogger: InjectionToken<Logger> = 'CliLogger';
