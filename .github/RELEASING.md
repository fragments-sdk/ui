# Releasing @usefragments/ui

The maintainers cut releases and publish them to npm as
[`@usefragments/ui`](https://www.npmjs.com/package/@usefragments/ui). This repository does not
publish.

Each release:

- raises `version` in `package.json` under [semantic versioning](https://semver.org/);
- adds an entry to [CHANGELOG.md](../CHANGELOG.md) that says what changes for people using the
  package;
- is published to npm, and `main` here carries the same version and changelog.

A breaking change waits for a major version and comes with a migration guide, like the
[v4 guide](../docs/migration-v4.md).

To ask for a release, or to report a problem with a published version, open an
[issue](https://github.com/fragments-sdk/ui/issues).
