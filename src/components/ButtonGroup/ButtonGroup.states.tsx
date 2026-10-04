/**
 * State fixtures for ButtonGroup, rendered by `pnpm run test:states`.
 *
 * @family:actions
 * @na:empty A fused group always holds its two actions.
 * @na:loading Pending belongs to the Button inside the group.
 * @na:error Errors show at the field or the form, never on the group.
 */
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Stack } from "../Stack";
import { ButtonGroup } from ".";

function Caret() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

export function populated() {
  return (
    <Stack direction="row" gap="md" align="center" wrap>
      <ButtonGroup aria-label="Deploy options">
        <Button>Deploy</Button>
        <IconButton variant="soft" aria-label="More deploy options">
          <Caret />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup aria-label="Save options">
        <Button variant="soft">Save</Button>
        <IconButton variant="soft" aria-label="More save options">
          <Caret />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup aria-label="Filter options">
        <Button variant="ghost">Filter</Button>
        <IconButton aria-label="More filter options">
          <Caret />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup aria-label="Row options">
        <Button variant="soft" size="xs">
          Edit
        </Button>
        <IconButton variant="soft" size="xs" aria-label="More row options">
          <Caret />
        </IconButton>
      </ButtonGroup>
    </Stack>
  );
}

// A long label in a narrow box: the group never wraps, the label stays on one line.
export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <ButtonGroup aria-label="Publish options">
        <Button variant="soft">Publish to every workspace</Button>
        <IconButton variant="soft" aria-label="More publish options">
          <Caret />
        </IconButton>
      </ButtonGroup>
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack direction="row" gap="md" align="center" wrap>
      <ButtonGroup aria-label="Hovered">
        <Button variant="soft" data-states-interact="hover">
          Hover
        </Button>
        <IconButton variant="soft" aria-label="More">
          <Caret />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup aria-label="Focused">
        <Button variant="soft">Save</Button>
        <IconButton variant="soft" aria-label="Focus" data-states-interact="focus">
          <Caret />
        </IconButton>
      </ButtonGroup>
      <ButtonGroup aria-label="Disabled">
        <Button variant="soft" disabled>
          Save
        </Button>
        <IconButton variant="soft" aria-label="More" disabled>
          <Caret />
        </IconButton>
      </ButtonGroup>
    </Stack>
  );
}
