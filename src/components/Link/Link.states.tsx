/**
 * State fixtures for Link, rendered by `pnpm run test:states`.
 *
 * @family:actions
 * @na:empty A link always names its destination.
 * @na:loading Navigation has no pending state on the link itself.
 * @na:error A broken destination is the page's error, not the link's.
 */
import { Stack } from "../Stack";
import { Text } from "../Text";
import { Link } from ".";

export function populated() {
  return (
    <Stack gap="sm">
      <Text>
        Read the <Link href="#guide">migration guide</Link> before upgrading, or browse the{" "}
        <Link href="#changelog" tone="neutral">
          changelog
        </Link>
        .
      </Text>
      <Stack direction="row" gap="md">
        <Link href="#accent">Accent</Link>
        <Link href="#neutral" tone="neutral">
          Neutral
        </Link>
        <Link href="https://example.com" external>
          External
        </Link>
      </Stack>
    </Stack>
  );
}

// A long unbroken destination wraps anywhere instead of overflowing its box.
export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <Text>
        See <Link href="#long">https://example.com/workspaces/settings/notifications/digest</Link>
      </Text>
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack direction="row" gap="md">
      <Link href="#rest">Rest</Link>
      <Link href="#hover" data-states-interact="hover">
        Hover
      </Link>
      <Link href="#neutral-hover" tone="neutral" data-states-interact="hover">
        Neutral hover
      </Link>
      <Link href="#focus" data-states-interact="focus">
        Focus
      </Link>
    </Stack>
  );
}
