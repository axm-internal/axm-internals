import type { ContainerInterface, InjectionToken } from '../interfaces/ContainerInterface';

/**
 * Simple in-memory container for registering and resolving instances.
 *
 * @remarks
 * Intended for lightweight CLI apps that do not require advanced DI features.
 * @example
 * ```ts
 * const container = new InMemoryContainer();
 * container.registerInstance('Logger', console);
 * ```
 */
export class InMemoryContainer implements ContainerInterface {
    /**
     * Map of registered instances keyed by injection token.
     *
     * @remarks
     * Direct access is provided mainly for diagnostics.
     * @example
     * ```ts
     * const hasLogger = container.store.has('Logger');
     * ```
     */
    public readonly store: Map<InjectionToken, unknown> = new Map<InjectionToken, unknown>();

    /**
     * Resolve a registered instance.
     *
     * @param token - The token used to identify the instance.
     * @returns The registered instance.
     * @remarks
     * Throws when the token has no registered instance.
     * @example
     * ```ts
     * const logger = container.resolve('Logger');
     * ```
     */
    resolve<T = unknown>(token: InjectionToken<T>): T {
        const instance = this.store.get(token);
        if (!instance) {
            throw new Error(`No instance registered for token "${String(token)}"`);
        }
        return instance as T;
    }

    /**
     * Register an instance for a token.
     *
     * @param token - The token used to identify the instance.
     * @param instance - The instance to register.
     * @returns The container for chaining.
     * @remarks
     * Replaces any existing instance for the same token.
     * @example
     * ```ts
     * container.registerInstance('Logger', console);
     * ```
     */
    registerInstance<T>(token: InjectionToken<T>, instance: T): ContainerInterface {
        this.store.set(token, instance);
        return this;
    }
}
