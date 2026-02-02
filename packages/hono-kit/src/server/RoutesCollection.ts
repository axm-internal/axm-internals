import type { AnyRouteDefinition, HttpMethod } from '../routing/route';
import type { RoutesArray, RoutesInput, RoutesObject } from './types';

export type NormalizedRouteDefinition = AnyRouteDefinition & {
    method: HttpMethod;
    path: string;
};

export type RouteMetadata = {
    method: HttpMethod;
    path: string;
    authorized?: boolean;
};

const httpMethods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all'];

const isHttpMethod = (value: string): value is HttpMethod => httpMethods.includes(value as HttpMethod);

export class RoutesCollection {
    protected routes: NormalizedRouteDefinition[] = [];

    constructor(initial?: RoutesInput) {
        if (initial) {
            this.add(initial);
        }
    }

    add = (input: RoutesInput): void => {
        if (Array.isArray(input)) {
            this.addArray(input);
            return;
        }

        this.addObject(input);
    };

    get items(): readonly NormalizedRouteDefinition[] {
        return this.routes;
    }

    toJSON = (): RouteMetadata[] =>
        this.routes.map((route) => ({
            method: route.method,
            path: route.path,
            authorized: route.authorized,
        }));

    protected addArray = (routes: RoutesArray): void => {
        for (const route of routes) {
            this.routes.push(this.normalizeArrayRoute(route));
        }
    };

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
