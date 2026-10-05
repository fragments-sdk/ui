// How the state harness names its tests. playwright.config.ts and states.spec.ts build the tests
// from these.

/** The Playwright projects, in run order; playwright.config.ts gives each its browser. */
export const PROJECTS = /** @type {const} */ (["chromium", "webkit", "firefox", "coarse"]);

/** Every fixture renders once per theme. */
export const THEMES = /** @type {const} */ (["light", "dark"]);

/** The spec file, named as Playwright titles it: relative to the config's directory. */
export const SPEC_FILE = "states.spec.ts";

/** A test's title inside its subject's describe block. */
export function testTitle(state, theme) {
  return `${state} (${theme})`;
}

/** A fixture's test tags: its family, then each header tag. */
export function testTags({ family, tags }) {
  return [`@family:${family}`, ...tags.map((tag) => `@${tag}`)];
}
