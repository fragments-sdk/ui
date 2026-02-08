export { render, screen, within, act, waitFor } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
import { expect } from 'vitest';
import { axe } from 'vitest-axe';

const DEFAULT_DISABLED_RULES = ['page-has-heading-one', 'region'] as const;

type AxeRules = NonNullable<Parameters<typeof axe>[1]>['rules'];

export interface A11yAssertOptions {
  /**
   * Explicit root for axe scan. Defaults to document body to include portals.
   */
  root?: Element;
  /**
   * When true (default), audit document body instead of the render container.
   */
  includeDocumentBody?: boolean;
  /**
   * Rules to disable in addition to defaults.
   */
  disabledRules?: string[];
  /**
   * Optional axe rule overrides.
   */
  rules?: AxeRules;
}

function buildRulesConfig(options: A11yAssertOptions): AxeRules {
  const disabledRuleIds = [
    ...DEFAULT_DISABLED_RULES,
    ...(options.disabledRules ?? []),
  ];

  const disabledRules = disabledRuleIds.reduce<AxeRules>((rules, id) => {
    rules[id] = { enabled: false };
    return rules;
  }, {});

  return {
    ...disabledRules,
    ...(options.rules ?? {}),
  };
}

export async function runA11yAudit(
  container: Element,
  options: A11yAssertOptions = {},
) {
  const includeDocumentBody = options.includeDocumentBody ?? true;
  const auditRoot = options.root
    ?? (includeDocumentBody ? container.ownerDocument.body : container);

  return axe(auditRoot, {
    rules: buildRulesConfig(options),
  });
}

/**
 * Asserts that rendered UI has no axe-core accessibility violations.
 *
 * By default this audits `document.body` so portaled overlays (Dialog, Menu,
 * Select, Tooltip, etc.) are included in the scan.
 */
export async function expectNoA11yViolations(
  container: Element,
  options: A11yAssertOptions = {},
) {
  const results = await runA11yAudit(container, options);
  expect(results).toHaveNoViolations();
}
