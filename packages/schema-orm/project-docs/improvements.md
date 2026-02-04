# SQLite Improvements (Ideas)

This document lists runtime improvements and defaults to consider across SQLite drivers.
These are **suggestions**, not current behavior.

## Common (All Adapters) — PRAGMA Defaults

Use PRAGMAs at connection startup to tune performance and consistency. Recommended baseline:
- `journal_mode = WAL`
- `synchronous = NORMAL` (when using WAL)
- `busy_timeout = 5000`
- `foreign_keys = ON` (when relations ship)

## Common (All Adapters) — Memory/IO Tuning

Optional knobs depending on workload:
- `cache_size` (pages or KiB when negative)
- `mmap_size` (memory‑mapped IO for read‑heavy use)
- `temp_store` (temporary tables/sorts in memory or disk)

## Common (All Adapters) — WAL Maintenance

For write‑heavy workloads:
- `wal_autocheckpoint` tuning
- periodic `PRAGMA optimize` for long‑lived databases

## Common (All Adapters) — Safety & Consistency

- Apply PRAGMAs per connection to avoid mismatched behavior.
- Prefer explicit connection‑level configuration over ad‑hoc calls later.

## Adapter: bun-sqlite

- PRAGMA application is synchronous via `Database.run`.
- Good fit for local‑first, sync applications; baseline PRAGMAs are a safe default.

## Adapter: better-sqlite3

- PRAGMA application via `Database.pragma(...)`.
- Same baseline PRAGMAs apply; consider `busy_timeout` for concurrent reads/writes.

## Adapter: expo-sqlite

- PRAGMA application via `execSync` on the `SQLiteDatabase`.
- Mobile constraints may prefer conservative settings (e.g., lower `cache_size`).
