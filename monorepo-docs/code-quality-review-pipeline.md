# axm‑internals – Quality & Review Pipeline

This document defines the full quality and review stack for the `axm‑internals` monorepo. The goal is to create a layered, zero‑friction system that:

* Catches obvious mistakes before code leaves your machine
* Improves code as it’s being written
* Provides holistic, cross‑file review at PR time
* Aggregates *all* feedback into a single report an AI agent can reason about

The result is a progressive quality pipeline that mirrors a mature engineering org—powered entirely by tools and automation.

---

## The Four‑Layer Model

| Layer | Tool                             | Purpose                                                         | Timing              |
| ----: | -------------------------------- | --------------------------------------------------------------- | ------------------- |
|     1 | **Semgrep**                      | Deterministic guardrails (security, bad patterns, obvious bugs) | Pre‑push            |
|     2 | **Sourcery (IDE plugin)**        | Inline refactors and suggestions while coding                   | During development  |
|     3 | **CodeRabbit**                   | Holistic, cross‑file AI review                                  | On Pull Request     |
|     4 | **Custom Aggregator + AI Agent** | Normalize *all* feedback into a single actionable report        | Post‑PR / Pre‑merge |

Each layer adds a different kind of signal without overlapping responsibilities.

---

## Layer 1 – Semgrep (Pre‑Push Guardrails)

Semgrep runs locally before code is pushed. It catches:

* Security issues
* Dangerous patterns
* Obvious logic errors
* Policy violations

Typical usage:

```bash
semgrep --config auto --json --output .qa/semgrep.json
```

In a monorepo, it can be scoped per package:

```bash
semgrep --config auto packages/cli-helper
```

This step is wired into a `pre-push` hook. If it fails, the push is blocked.

Semgrep produces structured JSON that can later be consumed by an AI agent.

---

## Layer 2 – Sourcery (IDE‑Time Coaching)

Sourcery runs inside the editor and provides:

* Inline refactors
* Readability improvements
* Idiomatic suggestions
* Early design feedback

This layer operates *while you are writing code* and never blocks progress. It is purely advisory and fast.

Because Sourcery also comments on PRs, its feedback becomes part of the global review signal later.

---

## Layer 3 – CodeRabbit (PR‑Level AI Review)

CodeRabbit performs full PR analysis:

* Cross‑file reasoning
* Architectural feedback
* Behavioral concerns
* Suggestions that require broader context

It acts as the “external reviewer” that sees the change as a whole.

This layer is intentionally *not* local. It represents a second set of eyes.

---

## Layer 4 – Aggregation + AI Reasoning

All feedback is normalized into a single report that an AI agent can reason about.

Inputs:

* Semgrep JSON output
* GitHub PR comments (including Sourcery + CodeRabbit)
* Review metadata (files, authors, timestamps)

Example flow:

```bash
# Pull review data
gh pr view $PR --json comments,reviews > .qa/github.json

# Aggregate
bun run qa-aggregate.ts \
  .qa/semgrep.json \
  .qa/github.json \
  > .qa/report.json

# Agent consumption
codex analyze .qa/report.json
```

This enables questions like:

* “Summarize unresolved concerns by package.”
* “Which issues are architectural vs stylistic?”
* “What is the risk profile of this PR?”
* “Which feedback is duplicated across tools?”

The agent becomes a *meta‑reviewer*.

---

## Coverage – Codecov

Coverage is tracked with Codecov using **per‑package flags**.

Each package generates its own coverage report:

```bash
bun test packages/cli-helper --coverage
```

Upload per package:

```yaml
- uses: codecov/codecov-action@v4
  with:
    files: packages/cli-helper/coverage/lcov.info
    flags: cli-helper
```

This provides:

* Overall repo coverage
* Per‑package coverage
* Diffs per package

Each internal package becomes a “virtual project” inside the monorepo.

---

## Code Quality – Qlty

Qlty (formerly Code Climate) is used for structural quality and maintainability.

Qlty is monorepo‑native:

* Path‑scoped projects
* Per‑package metrics
* Flexible configuration
* Native monorepo support

Example conceptual layout:

```yaml
projects:
  cli-helper:
    root: packages/cli-helper
  logger:
    root: packages/logger
  zod-helpers:
    root: packages/zod-helpers
```

Each internal package evolves independently while living in a single repo.

---

## The Philosophy

This pipeline encodes a simple rule:

> Obvious mistakes are blocked. Style is coached. Architecture is reviewed. All feedback is unified.

You get:

* Zero surprise breakage
* Continuous improvement while coding
* Fresh eyes at PR time
* A single source of truth for review insight

It’s not just “using AI tools.”

It’s orchestrating a personal engineering platform.
