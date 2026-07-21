// Ambient type surface for the side-effect style entrypoints
// (`@usefragments/ui/styles` and `@usefragments/ui/globals`). These specifiers
// resolve to compiled CSS (or the raw SCSS under the `sass` condition) and carry
// no runtime exports, so a bare `import "@usefragments/ui/styles";` needs a
// resolvable `types` target to keep TypeScript from erroring. This file ships in
// the published tarball via the package `files: ["src"]` entry and is referenced
// by the `types` condition of both exports in `publishConfig`.
export {};
