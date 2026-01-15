# Intro to Changesets

Changesets is the release system for this monorepo. It tracks *intent* (what changed and how it should be versioned) and automates version bumps and publishing.

## Core Ideas

- A **changeset** is a small markdown file that describes a change.
- Each changeset picks one or more packages and a bump type: `patch`, `minor`, or `major`.
- Changesets are committed with your code. CI uses them to publish.

## Typical Workflow

1. Make your code changes.
2. Create a changeset:

```bash
bun changeset
```

3. Select the packages and bump types.
4. Write a short summary of the change.
5. Commit the generated file under `.changeset/`.
6. Merge to `main`.
7. The Release workflow runs `changesets/action`, which:
   - bumps versions
   - updates changelogs
   - publishes packages

## Bump Types

- **patch**: bug fixes, refactors, no new features
- **minor**: new backwards-compatible features
- **major**: breaking changes

## Publishing

Publishing is triggered by pushes to `main` **when changesets exist**. The workflow uses `changeset publish` to publish affected public packages.

## Changelogs

Changesets can generate changelogs automatically. The current config uses the default Changesets changelog generator. The summary you write in each changeset becomes the changelog entry.

## Tips

- Keep changeset summaries short and user-facing.
- Group multiple related package bumps into a single changeset when appropriate.
- If no packages should be released, don’t add a changeset.

## Conventional Commits (Optional)

If you want to generate changesets from conventional commits, use:

```bash
bun changeset:from-commits
```

This uses `@bob-obringer/conventional-changesets` to infer package bumps from git history. It compares `main` to your current branch, so run it from the feature branch you want to release.
