export { render, screen, within, act, waitFor } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
import { expect } from 'vitest';
import { axe } from 'vitest-axe';

/**
 * Asserts that a rendered container has no axe-core accessibility violations.
 * Disables page-level rules that fire on isolated component renders.
 */
export async function expectNoA11yViolations(container: Element) {
  const results = await axe(container, {
    rules: {
      // Page-level rules that don't apply to isolated component tests
      'page-has-heading-one': { enabled: false },
      region: { enabled: false },
    },
  });
  expect(results).toHaveNoViolations();
}
