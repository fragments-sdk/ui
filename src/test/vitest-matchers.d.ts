// Typecheck lane for tests and stories (tsconfig.tests.json): the matcher
// packages augment `vitest` from their own install location, which the
// workspace layout does not resolve, so the augmentation is restated here
// against the copy of vitest this package resolves.
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import type { AxeMatchers } from "vitest-axe/matchers";

declare module "vitest" {
  interface Assertion<T = any> extends TestingLibraryMatchers<any, T>, AxeMatchers {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, any>, AxeMatchers {}
}
