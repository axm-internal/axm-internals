## HttpApp Improvement Tracking

### Completed
- Added schema-backed validation for required parameters so misconfigurations fail fast.
- Guarded against middleware mutation leaks by cloning and appending immutably.
- Introduced an optional `notFoundHandler` parameter (instead of a setter) so 404 behavior is configurable.
- Exported helper option types and provided safe defaults (e.g., default CORS origins).
- Request logger now automatically wires request tracking to ensure `requestId` and timing metadata are present.

### Pending
- Offer both base-path routing and a direct `.mount(routes)` option so consumers can opt out of prefixing.
