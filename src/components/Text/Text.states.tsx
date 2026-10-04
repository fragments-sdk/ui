/**
 * State fixtures for Text, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:empty Text with nothing to say is not rendered; the surface around it owns the empty state.
 * @na:loading Text never waits; a loading line is a Skeleton bar.
 * @na:error Text has no failure of its own; the danger ink is a populated state.
 * @na:lifecycle Text never changes after it renders except through new children.
 */
import { Text } from ".";
import { Stack } from "../Stack";
import { colorAs, find, oncePerHost, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames } from "../../test/token-probe";

const LADDER = [
  ["caption", "11px"],
  ["control", "11px"],
  ["body", "12px"],
  ["code", "12px"],
  ["title", "15px"],
  ["display", "24px"],
  ["section-label", "11px"],
] as const;

const checkLadder = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  for (const [role, size] of LADDER) {
    const style = getComputedStyle(find<HTMLElement>(host, `[data-role="${role}"]`));
    add(`${role} sits on ${size}`, style.fontSize, style.fontSize === size);
  }
  const label = getComputedStyle(find<HTMLElement>(host, '[data-role="section-label"]'));
  add(
    "The section label is tertiary ink",
    label.color,
    label.color === colorAs(host, "var(--fui-text-tertiary)")
  );
  const accent = getComputedStyle(find<HTMLElement>(host, '[data-role="accent"]'));
  add(
    "Accent is the accent's text ink",
    accent.color,
    accent.color === colorAs(host, "var(--fui-color-accent-text)")
  );
  return checks;
});

export function populated() {
  return (
    <TokenChecks title="Ladder" check={checkLadder}>
      <Stack gap="sm">
        <Text as="h1" type="display" data-role="display">
          Two findings block the merge
        </Text>
        <Text as="h2" type="title" data-role="title">
          Pull request 412
        </Text>
        <Text as="p" data-role="body">
          Two token files changed in{" "}
          <Text color="accent" data-role="accent">
            fragments-sdk/fragments
          </Text>{" "}
          since the last approval.
        </Text>
        <Text as="p" strong>
          Tokens
        </Text>
        <Text type="caption" color="tertiary" data-role="caption">
          Checked 2 minutes ago
        </Text>
        <Text type="control" data-role="control">
          Repository
        </Text>
        <Text type="code" data-role="code">
          c46ff42922e7c384
        </Text>
        <Text as="p" type="section-label" data-role="section-label">
          On this page
        </Text>
        <Text color="danger">The workflow token expired</Text>
      </Stack>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <Stack gap="sm">
        <Text as="p" truncate>
          fragments-sdk/a-repository-with-a-very-long-name changed its tokens
        </Text>
        <Text as="p" lineClamp={2}>
          Two token files changed since the last approval, and one canonical component was replaced
          by a local copy in the settings page.
        </Text>
        <Text as="p" type="code">
          fragments-sdk/a-repository-with-a-very-long-name-that-has-no-natural-break
        </Text>
      </Stack>
    </div>
  );
}
