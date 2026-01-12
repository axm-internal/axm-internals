# axm-internals

A private monorepo that powers your internal platform.

This model gives you:

- **Real packages with real versions** (private registry)
- **Strong contracts** between projects
- The ability to **edit package source while inside any project**
- **Explicit promotion** of changes (nothing breaks by surprise)
- **Zero-build, source-first packages** powered by Bun

It combines the safety of versioned dependencies with the creative flow of workspace-style development—without introducing unnecessary build steps.

---

## Repository Structure

```txt
axm-internals/
  package.json
  bun.lockb
  packages/
    cli-helper/
      package.json
      src/
    logger/
    zod-helpers/
```

Root `package.json`:

```json
{
  "name": "axm-internals",
  "private": true,
  "type": "module",
  "workspaces": ["packages/*"]
}
```

Each package is a *real* npm package, but **source-first** and **buildless**:

```json
// packages/cli-helper/package.json
{
  "name": "@axm/cli-helper",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "src/index.ts"
}
```

Because everything runs on Bun:

- Packages point directly at `.ts` entrypoints
- No `dist/` folders
- No `tsc` or bundling step
- Publishing ships *source*, not artifacts

`@axm/*` becomes your internal, living standard library.

---

## How Projects Consume It

In any project (Alpha, Beta, Delta):

```json
{
  "dependencies": {
    "@axm/cli-helper": "^0.1.0",
    "@axm/logger": "^0.2.0"
  }
}
```

Each project:

- Is pinned by semver
- Upgrades intentionally
- Cannot be broken by unrelated work

This creates clear boundaries and high confidence.

---

## Iterating From Inside a Project

When you’re in Project Beta and realize `cli-helper` needs improvement, you don’t leave your context—you *link* the package.

```bash
# in axm-internals/packages/cli-helper
bun link

# in Project Beta
bun link @axm/cli-helper
```

Now:

- `@axm/cli-helper` resolves to your local source
- You can edit `src/index.ts` in real time
- Beta reflects changes immediately

You are effectively “inside” the package while staying in Beta.

---

## Promoting a Change

When the fix or feature is ready:

1. Commit in `axm-internals`
2. Bump version (`0.1.1`, `0.2.0`, `1.0.0`, etc.)
3. Publish to the private registry
4. In the consuming project:

```bash
bun unlink @axm/cli-helper
bun install
```

Update the dependency to the new version.

Other projects remain stable until *they* choose to upgrade.

---

## The Resulting Workflow

- Projects depend on **published contracts**
- You iterate with **live source access**
- Nothing breaks implicitly
- Upgrades are visible and intentional
- Drift becomes obvious ("Alpha is still on 0.1.x")

You get:

- The creative flow of workspace development
- The safety and clarity of real versioning
- Zero build overhead across your internal ecosystem

This scales from solo hacking to full platform ownership without changing the philosophy—only the number of packages grows.

