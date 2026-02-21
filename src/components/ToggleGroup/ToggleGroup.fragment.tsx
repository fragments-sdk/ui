import React from "react";
import { defineFragment } from "@fragments-sdk/cli/core";
import { ToggleGroup } from ".";

function DefaultExample() {
  const [value, setValue] = React.useState("left");

  return (
    <ToggleGroup value={value} onChange={setValue}>
      <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
      <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
      <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
    </ToggleGroup>
  );
}

function PillsExample() {
  const [value, setValue] = React.useState("all");

  return (
    <ToggleGroup value={value} onChange={setValue} variant="pills">
      <ToggleGroup.Item value="all">All</ToggleGroup.Item>
      <ToggleGroup.Item value="active">Active</ToggleGroup.Item>
      <ToggleGroup.Item value="completed">Completed</ToggleGroup.Item>
    </ToggleGroup>
  );
}

function OutlineExample() {
  const [value, setValue] = React.useState("day");

  return (
    <ToggleGroup value={value} onChange={setValue} variant="outline">
      <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
      <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
      <ToggleGroup.Item value="month">Month</ToggleGroup.Item>
    </ToggleGroup>
  );
}

function SizesExample() {
  const [value1, setValue1] = React.useState("a");
  const [value2, setValue2] = React.useState("a");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <ToggleGroup value={value1} onChange={setValue1} size="sm">
        <ToggleGroup.Item value="a">Small</ToggleGroup.Item>
        <ToggleGroup.Item value="b">Size</ToggleGroup.Item>
      </ToggleGroup>
      <ToggleGroup value={value2} onChange={setValue2} size="md">
        <ToggleGroup.Item value="a">Medium</ToggleGroup.Item>
        <ToggleGroup.Item value="b">Size</ToggleGroup.Item>
      </ToggleGroup>
    </div>
  );
}

function ViewSwitcherExample() {
  const [view, setView] = React.useState("grid");

  return (
    <ToggleGroup value={view} onChange={setView} size="sm">
      <ToggleGroup.Item value="grid">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </ToggleGroup.Item>
      <ToggleGroup.Item value="list">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </ToggleGroup.Item>
    </ToggleGroup>
  );
}

function DisabledItemExample() {
  const [value, setValue] = React.useState("basic");

  return (
    <ToggleGroup value={value} onChange={setValue}>
      <ToggleGroup.Item value="basic">Basic</ToggleGroup.Item>
      <ToggleGroup.Item value="pro">Pro</ToggleGroup.Item>
      <ToggleGroup.Item value="enterprise" disabled>
        Enterprise
      </ToggleGroup.Item>
    </ToggleGroup>
  );
}

export default defineFragment({
  component: ToggleGroup,

  meta: {
    name: "ToggleGroup",
    description:
      "A group of toggle buttons where only one can be selected at a time. Useful for switching between views, modes, or options.",
    category: "forms",
    status: "stable",
    tags: ["toggle", "group", "fragmented", "control", "tabs", "switch"],
    since: "0.2.0",
  },

  usage: {
    when: [
      "Switching between mutually exclusive views or modes",
      "Selecting one option from a small set (2-5 options)",
      "Fragmented controls like view switchers",
      "Filter or sort options",
    ],
    whenNot: [
      "Multiple selections allowed (use Checkbox group)",
      "Many options (use Select or RadioGroup)",
      "Navigation between pages (use Tabs)",
      "On/off toggle (use Switch component)",
    ],
    guidelines: [
      "Keep options to 2-5 items for clarity",
      "Use clear, concise labels",
      "Consider icons for common actions (grid/list view)",
      "Ensure adequate touch targets on mobile",
    ],
    accessibility: [
      'Uses role="group" for semantic grouping',
      'Each item has role="radio" with aria-checked',
      "Keyboard navigable with Tab and arrow keys",
      "Focus visible on active item",
    ],
  },

  props: {
    value: {
      type: "string",
      description: "Currently selected value",
      required: true,
    },
    onChange: {
      type: "function",
      description: "Called with new value when selection changes",
    },
    onValueChange: {
      type: "function",
      description: "Alias for onChange (Radix convention): (value: string) => void",
    },
    children: {
      type: "node",
      description: "ToggleGroup.Item components",
      required: true,
    },
    variant: {
      type: "enum",
      description: "Visual style",
      values: ["default", "pills", "outline"],
      default: "default",
    },
    size: {
      type: "enum",
      description: "Size variant",
      values: ["sm", "md"],
      default: "md",
    },
    gap: {
      type: "enum",
      description: "Gap between items (pills/outline variants)",
      values: ["none", "xs", "sm"],
      default: "xs",
    },
  },

  relations: [
    {
      component: "RadioGroup",
      relationship: "alternative",
      note: "RadioGroup for form-style single selection",
    },
    { component: "Tabs", relationship: "alternative", note: "Tabs for content panel switching" },
    { component: "Switch", relationship: "sibling", note: "Switch for single on/off control" },
  ],

  contract: {
    propsSummary: [
      "value: string - selected value (required)",
      "onChange: (value: string) => void - change handler (or onValueChange)",
      "children: ToggleGroup.Item[] - toggle items",
      "variant: default|pills|outline - visual style",
      "size: sm|md - size variant",
      "gap: none|xs|sm - spacing",
    ],
    scenarioTags: ["forms.selection", "input.toggle", "control.fragmented"],
    a11yRules: ["A11Y_GROUP_ROLE", "A11Y_KEYBOARD_ACCESSIBLE"],
  },

  variants: [
    {
      name: "Default",
      description: "Basic toggle group",
      code: `<ToggleGroup value={value} onChange={setValue}>
  <ToggleGroup.Item value="left">Left</ToggleGroup.Item>
  <ToggleGroup.Item value="center">Center</ToggleGroup.Item>
  <ToggleGroup.Item value="right">Right</ToggleGroup.Item>
</ToggleGroup>`,
      render: () => <DefaultExample />,
    },
    {
      name: "Pills Variant",
      description: "Pill-shaped toggle buttons",
      code: `<ToggleGroup value={value} onChange={setValue} variant="pills">
  <ToggleGroup.Item value="all">All</ToggleGroup.Item>
  <ToggleGroup.Item value="active">Active</ToggleGroup.Item>
  <ToggleGroup.Item value="completed">Completed</ToggleGroup.Item>
</ToggleGroup>`,
      render: () => <PillsExample />,
    },
    {
      name: "Outline Variant",
      description: "Outlined toggle buttons",
      code: `<ToggleGroup value={value} onChange={setValue} variant="outline">
  <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
  <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
  <ToggleGroup.Item value="month">Month</ToggleGroup.Item>
</ToggleGroup>`,
      render: () => <OutlineExample />,
    },
    {
      name: "Sizes",
      description: "Different size variants",
      code: `<ToggleGroup value={value} onChange={setValue} size="sm">
  <ToggleGroup.Item value="a">Small</ToggleGroup.Item>
  <ToggleGroup.Item value="b">Size</ToggleGroup.Item>
</ToggleGroup>
<ToggleGroup value={value} onChange={setValue} size="md">
  <ToggleGroup.Item value="a">Medium</ToggleGroup.Item>
  <ToggleGroup.Item value="b">Size</ToggleGroup.Item>
</ToggleGroup>`,
      render: () => <SizesExample />,
    },
    {
      name: "View Switcher",
      description: "Common pattern for switching between views",
      code: `<ToggleGroup value={view} onChange={setView} size="sm">
  <ToggleGroup.Item value="grid"><GridIcon /></ToggleGroup.Item>
  <ToggleGroup.Item value="list"><ListIcon /></ToggleGroup.Item>
</ToggleGroup>`,
      render: () => <ViewSwitcherExample />,
    },
    {
      name: "With Disabled Item",
      description: "Toggle group with a disabled option",
      code: `<ToggleGroup value={value} onChange={setValue}>
  <ToggleGroup.Item value="basic">Basic</ToggleGroup.Item>
  <ToggleGroup.Item value="pro">Pro</ToggleGroup.Item>
  <ToggleGroup.Item value="enterprise" disabled>Enterprise</ToggleGroup.Item>
</ToggleGroup>`,
      render: () => <DisabledItemExample />,
    },
  ],
});
