/**
 * State fixtures for Kbd, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:empty A keycap always names a key; with no key there is nothing to draw.
 * @na:loading A keycap is static text and never waits on anything.
 * @na:error A keycap has no failure of its own; the control it hints at owns the error.
 * @na:lifecycle A keycap never changes after it renders.
 */
import { Kbd } from ".";
import { Stack } from "../Stack";
import { Text } from "../Text";
import { colorAs, find, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, type Check } from "../../test/token-probe";

async function checkCap(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const cap = find<HTMLElement>(host, "kbd:not(:has(kbd))");
  const style = getComputedStyle(cap);
  const tint = colorAs(host, "var(--fui-bg-active)");
  add("The cap is the press tint", style.backgroundColor, style.backgroundColor === tint);
  add("No edge", style.borderTopWidth, style.borderTopWidth === "0px");
  add("No shadow", style.boxShadow, style.boxShadow === "none");
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Keycap" check={checkCap}>
      <Stack gap="sm">
        <Stack direction="row" gap="sm" align="center">
          <Kbd>Esc</Kbd>
          <Kbd label="Enter">↵</Kbd>
          <Kbd>K</Kbd>
          <Kbd.Group>
            <Kbd label="Command">⌘</Kbd>
            <Kbd label="Shift">⇧</Kbd>
            <Kbd>P</Kbd>
          </Kbd.Group>
        </Stack>
        <Text>
          Press{" "}
          <Kbd.Group>
            <Kbd label="Command">⌘</Kbd>
            <Kbd>K</Kbd>
          </Kbd.Group>{" "}
          to search the repository.
        </Text>
      </Stack>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 160 }}>
      <Text>
        Hold{" "}
        <Kbd.Group>
          <Kbd>Control</Kbd>
          <Kbd>Option</Kbd>
          <Kbd>Backspace</Kbd>
        </Kbd.Group>{" "}
        to clear the field.
      </Text>
    </div>
  );
}
