import type { Meta, StoryObj } from "@storybook/react";
import { List, Monitor, Moon, SquaresFour, Sun } from "@phosphor-icons/react";
import * as React from "react";
import { Stack } from "../Stack";
import { Theme, useTheme, type ThemeMode } from "../Theme";
import { ToggleGroup } from ".";

/**
 * ToggleGroup is the segmented control: two to five options on one band
 * track, the chosen one on the lifted thumb. Compose `ToggleGroup.Item`
 * children rather than building a custom segmented control.
 */
const meta = {
  title: "Forms/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "Toggle buttons on one track. One option at a time by default; `multiple` lets several stay pressed. Prefer it over a hand-rolled segmented control for switching views or modes.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg"],
      description: "Size on the one track",
    },
    fullWidth: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    "aria-label": "Alignment",
    size: "md",
    defaultValue: "center",
    children: (
      <>
        <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
        <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
        <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
      </>
    ),
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <Stack gap="md" align="start">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <ToggleGroup key={size} aria-label={`Range, ${size}`} size={size} defaultValue="week">
          <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
          <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
          <ToggleGroup.Item value="month">Month</ToggleGroup.Item>
        </ToggleGroup>
      ))}
    </Stack>
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToggleGroup aria-label="Formatting" multiple defaultValue={["bold"]}>
      <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
      <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
      <ToggleGroup.Item value="underline">Underline</ToggleGroup.Item>
    </ToggleGroup>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [view, setView] = React.useState("grid");
    return (
      <ToggleGroup aria-label="View" size="sm" value={view} onValueChange={setView}>
        <ToggleGroup.Item value="grid" aria-label="Grid view">
          <SquaresFour aria-hidden />
        </ToggleGroup.Item>
        <ToggleGroup.Item value="list" aria-label="List view">
          <List aria-hidden />
        </ToggleGroup.Item>
      </ToggleGroup>
    );
  },
};

export const FullWidth: Story = {
  render: () => (
    <div style={{ inlineSize: 360 }}>
      <ToggleGroup aria-label="Plan" fullWidth defaultValue="monthly">
        <ToggleGroup.Item value="monthly">Monthly</ToggleGroup.Item>
        <ToggleGroup.Item value="yearly">Yearly</ToggleGroup.Item>
      </ToggleGroup>
    </div>
  ),
};

export const WithDisabledItem: Story = {
  render: () => (
    <ToggleGroup aria-label="Tier" defaultValue="basic">
      <ToggleGroup.Item value="basic">Basic</ToggleGroup.Item>
      <ToggleGroup.Item value="pro">Pro</ToggleGroup.Item>
      <ToggleGroup.Item value="enterprise" disabled>
        Enterprise
      </ToggleGroup.Item>
    </ToggleGroup>
  ),
};

function ColourModeControl() {
  const { mode, setMode } = useTheme();
  return (
    <ToggleGroup
      aria-label="Colour mode"
      size="sm"
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

/** The colour-mode control is a composition: a ToggleGroup wired to
 * `useTheme`, System first. */
export const ColourMode: Story = {
  render: () => (
    <Theme defaultMode="system">
      <ColourModeControl />
    </Theme>
  ),
};
