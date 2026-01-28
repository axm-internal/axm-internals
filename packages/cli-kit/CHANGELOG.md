# Changelog

## 2026-01-28T02:39:57-05:00
- chore(cli-kit): initialized new package
- feat(cli-kit): created CliOutputServiceInterface and concrete class
- feat(cli-kit): created Container interface to get rid of Tsyringe from project
- feat(cli-kit): created package schemas
- feat(cli-kit): created command definition to Command program helper
- feat(cli-kit): refactored expectation on how to use the app and created example in readme
- feat(cli-kit): completed CliApp class
- docs(cli-kit): added typedoc docblocks for the package
- feat: changed typedoc configs to exclude @internal symbols
- docs(cli-kit): add @internal where needed and created package docs
- ci(cli-kit): added cli-kit to the coverage matrix
- docs(cli-kit): updated llms.txt
- chore: addressing PR comments
- fix(cli-kit): capturing all commander errors except help/version
- refactor(tooling-config): updated packages and apps to use new tooling-config
- chore: fixed .gitignore typo
- chore(tooling-config): updated typedoc.json to reference relative docs dir
- fix(tooling-config): fixed missing entryPoints dir
- docs(cli-kit): mapped issue-16 scope and impacts
- refactor(cli-kit): used zod v4 metadata for descriptions
- refactor(cli-kit): avoided zod internals for unwrap/shape
- feat(cli-kit): validated command definitions with real schemas
- chore(cli-kit): improved zod guard errors
- feat(cli-kit): supported meta-based arg positions and aliases
- docs(cli-kit): updated docs based on changes
- docs(cli-kit): updating docs to reflect work done
- fix(cli-kit): fixed constructor of InjectionToken
- docs: updated docs to reflect API changes
- feat(cli-kit): passed container to hooks and defaulted logger to fatal
- docs: created backfilll changelogs
- chore(release): versioned packages
- feat(cli-kit): typed container generics for command actions

## 0.1.0
- chore(cli-kit): initialized new package
- feat(cli-kit): created CliOutputServiceInterface and concrete class
- feat(cli-kit): created Container interface to get rid of Tsyringe from project
- feat(cli-kit): created package schemas
- feat(cli-kit): created command definition to Command program helper
- feat(cli-kit): refactored expectation on how to use the app and created example in readme
- feat(cli-kit): completed CliApp class
- docs(cli-kit): added typedoc docblocks for the package
- feat: changed typedoc configs to exclude @internal symbols
- docs(cli-kit): add @internal where needed and created package docs
