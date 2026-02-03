import type { AnyRouteDefinition, HttpMethod } from '../routing/route';
import type { RoutesArray, RoutesInput, RoutesObject } from './types';

/**
 * @internal
 * Route definition with normalized method and path.
 *
 * @remarks
 * Normalized routes are guaranteed to include `method` and `path`.
 * @example
 * ```ts
 * const normalized: NormalizedRouteDefinition = {
 *   kind: 'route',
 *   method: 'get',
 *   path: '/health',
 *   schemas: {},
 *   handler: (c) => c.text('ok'),
 * };
 * ```
 */
export type NormalizedRouteDefinition = AnyRouteDefinition & {
    method: HttpMethod;
    path: string;
};

/**
 * @internal
 * Minimal metadata for registered routes.
 *
 * @remarks
 * Useful for diagnostics or reporting route registrations.
 * @example
 * ```ts
 * const meta: RouteMetadata = { method: 'get', path: '/health' };
 * ```
 */
export type RouteMetadata = {
    method: HttpMethod;
    path: string;
    authorized?: boolean;
};

/**
 * @internal
 * List of HTTP methods accepted by the router.
 *
 * @remarks
 * Used to validate method keys when registering routes.
 */
const httpMethods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all'];

/**
 * @internal
 * Validate that a string is a supported HTTP method.
 *
 * @param value - Method string to validate.
 * @returns `true` if the value is a known HTTP method.
 * @remarks
 * Uses the internal `httpMethods` list for validation.
 */
const isHttpMethod = (value: string): value is HttpMethod => httpMethods.includes(value as HttpMethod);

/**
 * Collection of normalized route definitions.
 *
 * @remarks
 * Accepts routes in array or object form and normalizes them for registration.
 * @example
 * ```ts
 * const collection = new RoutesCollection(routes);
 * collection.add(route({ method: 'get', path: '/health', schemas: {}, handler }));
 * ```
 */
export class RoutesCollection {
    /**
     * @internal
     * Internal storage for normalized routes.
     *
     * @remarks
     * Access via the `items` getter when needed.
     */
    protected routes: NormalizedRouteDefinition[] = [];

    /**
     * Create a new routes collection.
     *
     * @param initial - Optional initial routes to add.
     * @remarks
     * Initial routes are normalized and stored immediately.
     * @example
     * ```ts
     * const collection = new RoutesCollection(routes);
     * ```
     */
    constructor(initial?: RoutesInput) {
        if (initial) {
            this.add(initial);
        }
    }

    /**
     * Add routes to the collection.
     *
     * @param input - Routes in array or object form.
     * @returns Nothing.
     * @remarks
     * Routes are normalized before being stored.
     * @example
     * ```ts
     * collection.add([{ kind: 'route', method: 'get', path: '/health', schemas: {}, handler }]);
     * ```
     */
    add = (input: RoutesInput): void => {
        if (Array.isArray(input)) {
            this.addArray(input);
            return;
        }

        this.addObject(input);
    };

    /**
     * Get the normalized route definitions.
     *
     * @returns An immutable view of the stored routes.
     * @remarks
     * The returned array should be treated as read-only.
     * @example
     * ```ts
     * const routes = collection.items;
     * ```
     */
    get items(): readonly NormalizedRouteDefinition[] {
        return this.routes;
    }

    /**
     * Serialize route metadata for inspection.
     *
     * @returns Simplified route metadata.
     * @remarks
     * Excludes schema and handler data from the output.
     * @example
     * ```ts
     * const metadata = collection.toJSON();
     * ```
     */
    toJSON = (): RouteMetadata[] =>
        this.routes.map((route) => ({
            method: route.method,
            path: route.path,
            authorized: route.authorized,
        }));

    /**
     * @internal
     * Add array-form routes to the collection.
     *
     * @param routes - Array of route definitions.
     * @returns Nothing.
     * @remarks
     * Each route is validated and normalized.
     */
    protected addArray = (routes: RoutesArray): void => {
        for (const route of routes) {
            this.routes.push(this.normalizeArrayRoute(route));
        }
    };

    /**
     * @internal
     * Add object-form routes to the collection.
     *
     * @param routes - Object of route definitions keyed by path and method.
     * @returns Nothing.
     * @remarks
     * Invalid method keys will throw an error.
     */
    protected addObject = (routes: RoutesObject): void => {
        for (const [path, methodMap] of Object.entries(routes)) {
            if (!methodMap) {
                continue;
            }

            for (const [methodKey, route] of Object.entries(methodMap)) {
                if (!route) {
                    continue;
                }

                if (!isHttpMethod(methodKey)) {
                    throw new Error(`Invalid http method "${methodKey}" for route "${path}"`);
                }

                this.routes.push(this.normalizeObjectRoute(route, methodKey, path));
            }
        }
    };

    /**
     * @internal
     * Normalize a route from array form.
     *
     * @param route - Route definition to normalize.
     * @returns A normalized route definition.
     * @remarks
     * Ensures `method` and `path` are present.
     */
    protected normalizeArrayRoute = (route: AnyRouteDefinition): NormalizedRouteDefinition => {
        if (!route || route.kind !== 'route') {
            throw new Error('RoutesCollection only accepts route() definitions.');
        }

        if (!route.method || !route.path) {
            throw new Error('Routes in array form must include both method and path.');
        }

        return {
            ...route,
            method: route.method,
            path: route.path,
        };
    };

    /**
     * @internal
     * Normalize a route from object form.
     *
     * @param route - Route definition to normalize.
     * @param method - Method derived from the object key.
     * @param path - Path derived from the object key.
     * @returns A normalized route definition.
     * @remarks
     * Ensures explicit `method` and `path` do not conflict with the keys.
     */
    protected normalizeObjectRoute = (
        route: AnyRouteDefinition,
        method: HttpMethod,
        path: string
    ): NormalizedRouteDefinition => {
        if (!route || route.kind !== 'route') {
            throw new Error('RoutesCollection only accepts route() definitions.');
        }

        if (route.method && route.method !== method) {
            throw new Error(`Route method mismatch for "${path}" (${method}).`);
        }

        if (route.path && route.path !== path) {
            throw new Error(`Route path mismatch for "${path}".`);
        }

        return {
            ...route,
            method,
            path,
        };
    };
}
