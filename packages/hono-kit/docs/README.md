**@axm-internal/hono-kit**

***

# @axm-internal/hono-kit

Opinionated Hono server wrapper with Zod-first validation and API-first defaults.

## Install

```bash
bun add @axm-internal/hono-kit
```

## MVP Features

- Zod validation for params, query, headers, and body.
- Response validation runs when a `response` schema is provided (validates `data` only).
- JSON responses are wrapped in a success envelope by default.
- Auth can be configured globally and overridden per route.
- Lifecycle hooks and default middleware bundle.

## Usage

```ts
import { createHonoServer, route } from "@axm-internal/hono-kit";
import { z } from "zod";

const routes = {
    "/health": {
        get: route({
            response: z.object({ status: z.literal("ok") }),
            handler: async (c) => c.json({ status: "ok" }),
        }),
    },
    "/users/:id": {
        get: route({
            params: z.object({ id: z.string() }),
            response: z.object({ id: z.string(), name: z.string() }),
            authorized: true,
            handler: async (c, input) =>
                c.json({ id: input.params.id, name: "Ada" }),
        }),
    },
};

const server = createHonoServer({
    name: "MyApi",
    routes,
    auth: {
        enabled: true,
        authAll: false,
    },
});

export const app = server.app;
```

## Route Helper Example

```ts
import { route } from "@axm-internal/hono-kit";
import { z } from "zod";

const getUser = route({
    method: "get",
    path: "/users/:id",
    params: z.object({ id: z.string() }),
    query: z.object({ includePosts: z.boolean().optional() }).optional(),
    response: z.object({ id: z.string(), name: z.string() }),
    authorized: true,
    handler: async (c, input) =>
        c.json({ id: input.params.id, name: "Ada" }),
});
```

## Auth Middleware Example

```ts
import { createHonoServer, createQueryTokenChecker, route } from "@axm-internal/hono-kit";
import { z } from "zod";

const authMiddleware = createQueryTokenChecker({
    service: {
        verifyToken: (token) => token === "valid",
    },
});

const server = createHonoServer({
    name: "AuthApi",
    auth: {
        enabled: true,
        authAll: true,
        middleware: authMiddleware,
    },
    routes: {
        "/secure": {
            get: route({
                response: z.object({ ok: z.boolean() }),
                handler: (c) => c.json({ ok: true }),
            }),
        },
    },
});

export const app = server.app;
```

## Notes

- Source-first, buildless package (Bun).
- Entry point: `src/index.ts`.
- Response envelopes are enforced for JSON responses (except 204/304).
