# @axm-internal/hono-kit Documentation

Typedoc output should be generated from `src/` and published here or via the central docs site.

## MVP Overview

- Zod validation for params, query, headers, and body.
- Response validation runs when a `response` schema is provided (validates `data` only).
- JSON responses are wrapped in a success envelope by default.
- Auth can be configured globally and overridden per route.
- Lifecycle hooks and default middleware bundle.
