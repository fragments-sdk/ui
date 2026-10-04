/**
 * State fixtures for ComponentDefaults, rendered by `pnpm run test:states`.
 *
 * @family:actions
 * @na:empty The provider renders no element; there is nothing to be empty.
 * @na:loading The provider renders no element; nothing loads.
 * @na:error The provider renders no element; it has no error state.
 * @na:overflow The provider renders no element; its children own their overflow.
 * @na:lifecycle The provider renders no element; it has no interaction states.
 */
import { Stack } from "../Stack";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { ToggleGroup } from "../ToggleGroup";
import { ComponentDefaultsProvider, type ControlSize } from ".";

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function Row({ label }: { label: string }) {
  return (
    <Stack direction="row" gap="sm" align="center">
      <Button>{label}</Button>
      <Button variant="soft">Cancel</Button>
      <IconButton aria-label={`Add, ${label}`}>
        <Glyph />
      </IconButton>
      <ToggleGroup aria-label={`Range, ${label}`} defaultValue="week">
        <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
        <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
      </ToggleGroup>
    </Stack>
  );
}

export function populated() {
  const sizes: ControlSize[] = ["xs", "sm", "md", "lg"];
  return (
    <Stack gap="md" align="start">
      {sizes.map((size) => (
        <ComponentDefaultsProvider key={size} controlSize={size}>
          <Row label={`Region ${size}`} />
        </ComponentDefaultsProvider>
      ))}
      <ComponentDefaultsProvider controlSize="lg">
        <ComponentDefaultsProvider controlSize="xs">
          <Row label="Nested xs" />
        </ComponentDefaultsProvider>
      </ComponentDefaultsProvider>
      <ComponentDefaultsProvider controlSize="xs">
        <Stack direction="row" gap="sm" align="center">
          <Button size="lg">Explicit lg wins</Button>
        </Stack>
      </ComponentDefaultsProvider>
    </Stack>
  );
}
