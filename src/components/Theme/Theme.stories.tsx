import type { Meta, StoryObj } from "@storybook/react";
import { Monitor, Moon, Sun } from "@phosphor-icons/react";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Stack } from "../Stack";
import { Text } from "../Text";
import { ToggleGroup } from "../ToggleGroup";
import { Theme, useTheme, type ThemeMode } from ".";
import { RENDER_STATES } from "../../storybook/render-states";

/** The colour-mode control: a ToggleGroup wired to `useTheme`, System first. */
function ColourModeControl({ size = "sm" }: { size?: "xs" | "sm" | "md" | "lg" }) {
  const { mode, setMode } = useTheme();
  return (
    <ToggleGroup
      aria-label="Colour mode"
      size={size}
      value={mode}
      onValueChange={(next) => setMode(next as ThemeMode)}
    >
      <ToggleGroup.Item value="system">
        <Monitor aria-hidden />
        System
      </ToggleGroup.Item>
      <ToggleGroup.Item value="light">
        <Sun aria-hidden />
        Light
      </ToggleGroup.Item>
      <ToggleGroup.Item value="dark">
        <Moon aria-hidden />
        Dark
      </ToggleGroup.Item>
    </ToggleGroup>
  );
}

/** One icon button that flips light and dark, for a tight toolbar. */
function ColourModeButton() {
  const { resolvedMode, setMode } = useTheme();
  return (
    <IconButton
      aria-label={resolvedMode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setMode(resolvedMode === "dark" ? "light" : "dark")}
    >
      {resolvedMode === "dark" ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </IconButton>
  );
}

/**
 * Theme is the canonical theme-management primitive. Wrap your app with it
 * once at the root to supply light/dark/system mode via CSS custom
 * properties, with localStorage persistence — agents should use it (paired with
 * `useTheme` and a ToggleGroup) rather than wiring up bespoke theme state.
 */
const meta = {
  title: "Navigation/Theme",
  component: Theme,
  tags: ["autodocs", "canonical"],
  parameters: {
    renderStates: RENDER_STATES,
    docs: {
      description: {
        component:
          "Theme root supporting light, dark, and system modes with localStorage persistence. Prefer this over hand-rolled theme state.",
      },
    },
  },
  argTypes: {
    defaultMode: {
      control: "select",
      options: ["light", "dark", "system"],
      description: "Default theme mode for uncontrolled usage",
    },
    mode: {
      control: "select",
      options: ["light", "dark", "system"],
      description: "Controlled theme mode",
    },
    storageKey: { control: "text", description: "localStorage key for persistence" },
  },
  // No default mode: inside the page's Theme a story then follows the page's
  // mode instead of taking the system one for its own scope.
} satisfies Meta<typeof Theme>;

export default meta;

// Typed from the component: every story renders its own children, and JSX
// stays out of component-level args (compound parts carry a `.Root` cycle).
type Story = StoryObj<typeof Theme>;

export const Default: Story = {
  render: (args) => (
    <Theme {...args}>
      <Stack direction="row" gap="md" align="center">
        <ColourModeControl />
        <Text>Pick a mode</Text>
      </Stack>
    </Theme>
  ),
};

export const DarkDefault: Story = {
  args: { defaultMode: "dark" },
  render: (args) => (
    <Theme {...args}>
      <ColourModeControl />
    </Theme>
  ),
};

/** A tight toolbar flips light and dark with one IconButton. */
export const IconButtonFlip: Story = {
  args: { defaultMode: "light" },
  render: (args) => (
    <Theme {...args}>
      <ColourModeButton />
    </Theme>
  ),
};

/** A Theme inside another Theme scopes its subtree: dark and green here, whatever the page is. */
export const NestedScope: Story = {
  args: { defaultMode: "dark", brand: "#16a34a", style: { padding: "16px" } },
  render: (args) => (
    <Theme {...args}>
      <Stack direction="row" gap="md" align="center">
        <Button>Save</Button>
        <ColourModeControl />
      </Stack>
    </Theme>
  ),
};

/** Primary actions in ink instead of the accent, for one toolbar. */
export const InkChrome: Story = {
  args: { primaryChrome: "ink" },
  render: (args) => (
    <Theme {...args}>
      <Button>Publish</Button>
    </Theme>
  ),
};
