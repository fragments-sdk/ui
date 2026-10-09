# Contributing

Thanks for helping with `@usefragments/ui`. Questions, bug reports and feature ideas go in
[GitHub issues](https://github.com/fragments-sdk/ui/issues). For anything larger than a small fix,
open an issue first so we can agree on the approach before you write the code.

## Setup

```bash
git clone https://github.com/fragments-sdk/ui.git
cd ui
corepack pnpm install
```

Corepack uses the pnpm version pinned in `package.json`. Run `corepack enable` once to type `pnpm`
without the prefix. `pnpm dev` starts Storybook on port 6006.

## Where things live

Each component has a folder in `src/components/<Name>/`:

- `index.tsx`: the component, with named exports only
- `<Name>.module.scss`: its styles (CSS Modules)
- `<Name>.test.tsx`: unit tests (Vitest and Testing Library)
- `<Name>.stories.tsx`: Storybook stories
- `<Name>.states.tsx`: state fixtures for the browser lane ([states/README.md](../states/README.md))
- `<Name>.meta.json`: the metadata that `fragments.json` is built from

Some conventions the lint and tests hold you to:

- Compound components stay one export: `Object.assign(Root, { Part })`, used as `Card.Header`.
- Styles read tokens with a Sass fallback: `var(--fui-border, $fui-border)`.
- Every rule sits in a `fui.*` cascade layer.

## Before you open a pull request

Run the checks:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm test
```

If you changed how something looks or behaves in the browser, also run the lanes that cover it:
`pnpm test:states`, `pnpm test:geometry`, `pnpm test:contrast` or `pnpm test:rsc`. They need the
Playwright engines: `pnpm exec playwright install chromium webkit firefox`.

Add or update tests for what you changed. A user-facing change should say what changes for people
using the package, so the release notes can describe it.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`,
`refactor:`, `test:`, `build:`, `ci:` or `chore:`, then a short summary. Mark a breaking change with
`!`, as in `feat!: remove the size prop`.

## How a change lands

The maintainers review pull requests here. They apply an accepted change themselves, and it reaches
`main` with the next sync of the library's source, so the pull request is closed rather than
merged. The change then ships with the next release.

## Releases

The maintainers cut releases and publish them to npm. See [RELEASING.md](RELEASING.md).

## Conduct and security

Follow the [code of conduct](CODE_OF_CONDUCT.md). Report a vulnerability privately as described in
[SECURITY.md](SECURITY.md), not in an issue.
