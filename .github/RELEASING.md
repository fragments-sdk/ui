# Releasing @usefragments/ui

Releases run from GitHub Actions (`.github/workflows/release.yml`) and publish with
[npm trusted publishing](https://docs.npmjs.com/trusted-publishers): npm trusts this repository's
workflow through GitHub OIDC, so no npm token exists anywhere.

## Cut a release

1. Open a pull request that raises `version` in `package.json` (stable semver, above the current
   `latest`) and adds the matching `CHANGELOG.md` entry. Merge it once CI passes.
2. In **Actions → Release → Run workflow**, run it on `main` and type
   `publish versioned public packages` exactly.

The workflow then:

- refuses to run anywhere but the current tip of `main`, or without the exact phrase;
- proves trusted publishing can move a dist-tag by adding and removing a `release-preflight` tag,
  before anything is published;
- builds, packs once, and checks the packed manifest and every file it declares;
- installs that tarball into an empty project and server-renders `Button`;
- publishes those exact bytes to the `next` dist-tag, with provenance. It refuses a version that
  already exists with different bytes, is not above `latest`, or would move `next` backwards;
- downloads the published tarball and compares its bytes, then installs from `next` on Node 22 with
  pnpm and renders again;
- checks `main` has not moved, then moves `latest` to the new version. If that fails, it restores
  the previous `latest`.

Each run keeps its evidence (candidate, release state, cohort results, promotion) as a workflow
artifact for 90 days.

## When a run fails

- **Before the publish step:** nothing is public. Fix the cause and run the workflow again.
- **After the publish step:** the version is on `next` and `latest` has not moved. Running the
  workflow again at the same commit reuses the published version only if the rebuilt tarball is
  byte-identical; otherwise it stops, and the fix is a new version.

## One-time setup (package owner)

1. **npm.** On npmjs.com, open `@usefragments/ui` → **Settings** → **Trusted publishing** and set a
   GitHub Actions publisher:

   | Field                | Value            |
   | -------------------- | ---------------- |
   | Organization or user | `fragments-sdk`  |
   | Repository           | `ui`             |
   | Workflow filename    | `release.yml`    |
   | Environment name     | `npm-production` |
   | Allow `npm dist-tag` | on               |

   The dist-tag permission is off by default. Without it the run stops at the preflight step,
   before publishing anything.

2. **GitHub.** In this repository's **Settings → Environments**, create `npm-production` and limit
   its deployment branches to `main`. It needs no secrets.
