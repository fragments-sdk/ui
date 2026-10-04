/**
 * State fixtures for Box, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:empty An empty box is a blank plane; the region that owns it draws the empty state.
 * @na:loading A plane never waits on anything; Skeleton fills the content inside it.
 * @na:error A plane has no failure of its own; Alert owns state panels.
 * @na:lifecycle A plane never changes after it renders.
 */
import { Box } from ".";
import { Stack } from "../Stack";
import { colorAs, find, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, type Check } from "../../test/token-probe";

async function checkPlanes(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const planes: Array<[string, string]> = [
    ["canvas", "var(--fui-app-canvas-bg)"],
    ["band", "var(--fui-bg-secondary)"],
    ["surface", "var(--fui-bg-primary)"],
    ["raised", "var(--fui-bg-elevated)"],
  ];
  for (const [name, token] of planes) {
    const el = find<HTMLElement>(host, `[data-plane="${name}"]`);
    const style = getComputedStyle(el);
    add(
      `${name} paints its plane`,
      style.backgroundColor,
      style.backgroundColor === colorAs(host, token)
    );
    add(`${name} casts no shadow`, style.boxShadow, style.boxShadow === "none");
  }
  const surface = find<HTMLElement>(host, '[data-plane="surface"]');
  const line = colorAs(host, "var(--fui-border)");
  const edge = getComputedStyle(surface);
  add("The hairline is the one border colour", edge.borderTopColor, edge.borderTopColor === line);
  const strip = find<HTMLElement>(host, '[data-edge="block-end"]');
  const stripStyle = getComputedStyle(strip);
  add(
    "A block-end border draws one side",
    stripStyle.borderTopWidth,
    stripStyle.borderTopWidth === "0px"
  );
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Planes" check={checkPlanes}>
      <Box plane="canvas" inset="default" data-plane="canvas">
        <Stack gap="sm">
          <Box plane="band" radius="control" inset="compact" data-plane="band">
            Band
          </Box>
          <Box plane="surface" border radius="surface" inset="compact" data-plane="surface">
            <Stack gap="sm">
              Surface
              <Box plane="band" radius="nested" inset="compact">
                Nested tile
              </Box>
            </Stack>
          </Box>
          <Box plane="raised" border radius="surface" inset="compact" data-plane="raised">
            Raised
          </Box>
          <Box border="block-end" inset="compact" data-edge="block-end">
            Hairline below only
          </Box>
        </Stack>
      </Box>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 240 }}>
      <Box plane="surface" border radius="surface" inset="compact">
        Every governance finding raised against this repository in the last ninety days wraps inside
        the plane instead of pushing past its edge.
      </Box>
    </div>
  );
}
