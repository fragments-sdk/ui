/**
 * State fixtures for IconButton, rendered by `pnpm run test:states`.
 *
 * @family:actions
 * @na:empty An icon button always carries its glyph and an accessible name.
 * @na:error Errors show at the field or the form, never on the button.
 * @na:overflow A glyph on a square track cannot overflow.
 */
import { Stack } from "../Stack";
import { find, softEdgeChecks } from "../../test/recipe-checks";
import { TokenChecks } from "../../test/token-probe";
import { IconButton } from ".";

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

export function populated() {
  return (
    <Stack direction="row" gap="md" align="center">
      <IconButton aria-label="Add" variant="ghost">
        <Glyph />
      </IconButton>
      <IconButton aria-label="Add" variant="soft">
        <Glyph />
      </IconButton>
      <IconButton aria-label="Add" size="xs">
        <Glyph />
      </IconButton>
      <IconButton aria-label="Add" size="sm">
        <Glyph />
      </IconButton>
      <IconButton aria-label="Add" size="lg">
        <Glyph />
      </IconButton>
      <IconButton aria-label="Pinned" defaultPressed>
        <Glyph />
      </IconButton>
      <IconButton aria-label="Pinned" variant="soft" defaultPressed>
        <Glyph />
      </IconButton>
    </Stack>
  );
}

// Pending from the first paint: the spinner takes the glyph's place.
export function loading() {
  return (
    <Stack direction="row" gap="md" align="center">
      <IconButton aria-label="Syncing" pending>
        <Glyph />
      </IconButton>
      <IconButton aria-label="Syncing" variant="soft" pending>
        <Glyph />
      </IconButton>
    </Stack>
  );
}

export function lifecycle() {
  return (
    <Stack direction="row" gap="md" align="center">
      <IconButton aria-label="Rest">
        <Glyph />
      </IconButton>
      <IconButton aria-label="Hover" data-states-interact="hover">
        <Glyph />
      </IconButton>
      <IconButton aria-label="Press" data-states-interact="press">
        <Glyph />
      </IconButton>
      <IconButton aria-label="Focus" data-states-interact="focus">
        <Glyph />
      </IconButton>
      <IconButton aria-label="Disabled" disabled>
        <Glyph />
      </IconButton>
      <IconButton aria-label="Pressed hover" defaultPressed data-states-interact="hover">
        <Glyph />
      </IconButton>
    </Stack>
  );
}

// Soft is a tint with no edge; under high contrast it takes the strong edge.
function checkSoftEdge(host: HTMLElement) {
  return softEdgeChecks("Soft", find(host, '[data-role="soft"]'));
}

export function moreContrast() {
  return (
    <TokenChecks title="Soft under more contrast" check={checkSoftEdge}>
      <Stack direction="row" gap="md" align="center">
        <IconButton aria-label="Add" variant="soft" data-role="soft">
          <Glyph />
        </IconButton>
        <IconButton aria-label="Add" variant="ghost">
          <Glyph />
        </IconButton>
      </Stack>
    </TokenChecks>
  );
}
