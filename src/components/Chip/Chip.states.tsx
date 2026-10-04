/**
 * State fixtures for Chip, rendered by `pnpm run test:states`.
 *
 * @family:actions
 * @na:loading A chip shows a value that is already known.
 * @na:error A chip carries no validation of its own; the field around it does.
 */
import { Stack } from "../Stack";
import { Text } from "../Text";
import { Chip } from ".";

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M3 6h10M3 10h10M6 3l-1 10M11 3l-1 10" />
    </svg>
  );
}

export function populated() {
  return (
    <Stack gap="sm">
      <Stack direction="row" gap="xs" wrap>
        <Chip>Design</Chip>
        <Chip icon={<Glyph />}>release</Chip>
        <Chip onRemove={() => {}}>frontend</Chip>
      </Stack>
      <Chip.Group aria-label="Status filters" defaultValue={["open"]}>
        <Chip value="open">Open</Chip>
        <Chip value="draft">Draft</Chip>
        <Chip value="merged">Merged</Chip>
      </Chip.Group>
      <Stack direction="row" gap="xs">
        <Chip selected onClick={() => {}} onRemove={() => {}}>
          Selected and removable
        </Chip>
      </Stack>
    </Stack>
  );
}

// An empty filter row: the group holds no chips and says so in copy beside it.
export function empty() {
  return (
    <Stack direction="row" gap="sm" align="center">
      <Chip.Group aria-label="Applied filters">{null}</Chip.Group>
      <Text color="secondary">No filters applied</Text>
    </Stack>
  );
}

// A long label truncates inside its chip; the remove control stays whole.
export function overflow() {
  return (
    <div style={{ maxInlineSize: 160 }}>
      <Stack gap="xs">
        <Chip>packages/engine/src/compiler/core/loader.ts</Chip>
        <Chip onRemove={() => {}}>packages/engine/src/compiler/core/loader.ts</Chip>
      </Stack>
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack direction="row" gap="xs" wrap>
      <Chip selected={false}>Rest</Chip>
      <Chip selected={false} data-states-interact="hover">
        Hover
      </Chip>
      <Chip selected data-states-interact="hover">
        Selected hover
      </Chip>
      <Chip selected={false} data-states-interact="focus">
        Focus
      </Chip>
      <Chip selected={false} disabled>
        Disabled
      </Chip>
    </Stack>
  );
}
