// How the state harness names its tests. playwright.config.ts and states.spec.ts build the tests
// from these, and scripts/check-ledger.mjs reads them to know what a `--grep` case selects.

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

/**
 * The strings `--grep` is tested against for one fixture, one per project and theme: Playwright
 * joins the project, the spec file, the describe title (the subject), the test title and the tags
 * with spaces.
 */
export function grepTitles(fixture) {
  return PROJECTS.flatMap((project) =>
    THEMES.map((theme) =>
      [
        project,
        SPEC_FILE,
        fixture.subject,
        testTitle(fixture.state, theme),
        ...testTags(fixture),
      ].join(" ")
    )
  );
}

/**
 * A `--grep` value read the way Playwright's command line reads it: `/source/flags` as written,
 * anything else as a case-insensitive pattern. Returns a title predicate, or null when the value
 * is not a valid regular expression.
 */
export function grepMatcher(value) {
  const literal = value.match(/^\/(.*)\/([gi]*)$/);
  let pattern;
  try {
    // `g` only moves lastIndex between tests, which Playwright resets; leave it out.
    pattern = literal
      ? new RegExp(literal[1], literal[2].replace(/g/g, ""))
      : new RegExp(value, "i");
  } catch {
    return null;
  }
  return (title) => pattern.test(title);
}
