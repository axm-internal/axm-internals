import { z } from 'zod';

/**
 * Token used to register and resolve values from a container.
 *
 * @remarks
 * Tokens can be class constructors, strings, or symbols.
 * @example
 * ```ts
 * const token: InjectionToken = 'MyService';
 * ```
 */
export type InjectionToken<T = unknown> = (new (...args: unknown[]) => T) | string | symbol;

/**
 * Zod schema that validates container injection tokens.
 *
 * @remarks
 * Accepts string, symbol, or constructor values.
 * @example
 * ```ts
 * InjectionTokenSchema.parse('MyService');
 * ```
 */
export const InjectionTokenSchema: z.ZodType<InjectionToken> = z.custom<InjectionToken>(
    (value) => typeof value === 'string' || typeof value === 'symbol' || typeof value === 'function'
);

/**
 * Minimal dependency injection container interface.
 *
 * @remarks
 * Implementations must support registering and resolving instances by token.
 * @example
 * ```ts
 * const container: ContainerInterface = new InMemoryContainer();
 * container.registerInstance('Logger', console);
 * ```
 */
export interface ContainerInterface {
    /**
     * Register a concrete instance for a token.
     *
     * @param token - The token used to identify the instance.
     * @param instance - The instance to store.
     * @returns The container for chaining.
     * @remarks
     * Overwrites any existing instance for the same token.
     * @example
     * ```ts
     * container.registerInstance('Logger', console);
     * ```
     */
    registerInstance<T>(token: InjectionToken<T>, instance: T): ContainerInterface;
    /**
     * Resolve a previously registered instance.
     *
     * @param token - The token used to identify the instance.
     * @returns The registered instance.
     * @remarks
     * Implementations should throw when the token is missing.
     * @example
     * ```ts
     * const logger = container.resolve('Logger');
     * ```
     */
    resolve<T>(token: InjectionToken<T>): T;
}

/**
 * Zod schema that validates container-like objects.
 *
 * @remarks
 * Checks for required `resolve` and `registerInstance` methods.
 * @example
 * ```ts
 * ContainerSchema.parse(new InMemoryContainer());
 * ```
 */
export const ContainerSchema: z.ZodType<ContainerInterface> = z.custom<ContainerInterface>(
    (value) =>
        typeof value === 'object' &&
        value !== null &&
        typeof (value as ContainerInterface).resolve === 'function' &&
        typeof (value as ContainerInterface).registerInstance === 'function'
);
