# Future Ideas

These are non‑committal ideas that could improve DX or safety without bloating the core API.

1) Schema diff warnings
- Provide a human‑readable diff (added/removed/changed columns) when schema hash changes.

2) Soft‑migrations helper (opt‑in)
- Emit simple `ALTER TABLE` statements for common changes (add column, rename column).

3) Safer writes
- Optional guards to prevent accidental full‑table updates/deletes.

4) Column‑level serialization hooks
- Allow per‑field `serialize/deserialize` in `schema.meta` for custom types.

5) Dev‑mode schema linting
- Warn about missing primary keys, duplicate uniques, deprecated Zod APIs, etc.

6) Lightweight query logging
- Optional hook to log SQL + timing during development.
