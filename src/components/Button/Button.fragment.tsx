import { defineFragment } from "@usefragments/core";
import { Link } from "../Link";
import { Stack } from "../Stack";
import { Button } from "./index";

export default defineFragment(Button, {
  meta: {
    name: "Button",
    purpose: "Triggers an action — save, submit, delete, open.",
    category: "actions",
    status: "stable",
    tags: ["action", "button", "form", "interactive"],
  },
  states: {
    Solid: {
      render: <Button variant="solid">Save changes</Button>,
      note: "The one action you want people to take here. Accent tone by default.",
      canonical: true,
    },
    Soft: {
      render: <Button variant="soft">Cancel</Button>,
      note: "The neutral secondary: a quiet tint, no border, beside the main action.",
    },
    Ghost: {
      render: <Button variant="ghost">Learn more</Button>,
      note: "No fill, no border — for dense toolbars and repeated rows.",
    },
    Link: {
      render: <Button variant="link">View all →</Button>,
      note: "Reads like a link, behaves like an action.",
    },
    Danger: {
      render: (
        <Button variant="solid" tone="danger">
          Delete item
        </Button>
      ),
      note: "Destructive action people cannot undo: solid chrome, danger tone.",
    },
    Sizes: {
      render: (
        <Stack direction="row" gap="sm" align="center" wrap>
          <Button size="xs">Micro</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Stack>
      ),
      note: "The one track: xs 24 for in-row actions, sm 28, md 32, lg 40.",
    },
    Disabled: {
      render: <Button disabled>Unavailable</Button>,
      note: "Blocks clicks and drops the button out of the tab order.",
    },
    Pending: {
      render: <Button pending>Saving</Button>,
      note: "Work is running: presses are ignored at once, the spinner shows after a second.",
    },
    Render: {
      render: (
        <Button variant="soft" render={<a href="#billing-settings" />}>
          Billing settings
        </Button>
      ),
      note: "render swaps the element; an anchor keeps its link role and takes the look.",
    },
    "Long Label": {
      render: (
        <Button>
          Save the localized account preferences and notify every affected workspace administrator
        </Button>
      ),
      note: "Long labels stay on one line; shorten the label or give the button room.",
    },
  },
  guidance: {
    when: [
      "Running an action: save, submit, delete",
      "Submitting a form",
      "Opening a dialog or menu",
    ],
    whenNot: [
      "Plain navigation — use Link",
      "Toggling state — use Switch or Checkbox",
      "Picking an option — use Select or RadioGroup",
    ],
    guidelines: [
      "One solid accent button per form or section",
      'tone="danger" for anything destructive',
      "Chroma is earned: leave tone at its default unless the action carries that meaning",
      "soft is the neutral secondary; soft and ghost show danger as ink, never a coloured fill",
      "pending while work runs: it ignores presses without disabling the button",
      "render={<a href />} for a link that looks like a button; the anchor keeps its link role",
      "Icon-only actions use IconButton",
    ],
    accessibility: [
      "Label the action, not the widget",
      'No "Click here"',
      "Icon-only buttons need aria-label",
    ],
    dont: [
      {
        reason: "Do not use a Button for plain navigation.",
        bad: '<Button href="/settings">Settings</Button>',
        good: <Link href="/settings">Settings</Link>,
      },
    ],
  },
  matrix: {
    axes: { variant: "auto", tone: "auto", size: "auto", theme: ["light", "dark"] },
    forced: ["hover", "focus", "disabled"],
    worstCase: { children: "A long localized action label that wraps without hiding the action" },
  },
  preview: { providers: [], dynamicRegions: [] },
  relations: [
    {
      component: "Link",
      relationship: "alternative",
      note: "Use Link for navigation without action context",
    },
    {
      component: "Icon",
      relationship: "complementary",
      note: "Use Icon inside Button for a leading or trailing glyph",
    },
    {
      component: "ButtonGroup",
      relationship: "parent",
      note: "ButtonGroup fuses a Button and an IconButton menu trigger into a split button",
    },
    {
      component: "IconButton",
      relationship: "sibling",
      note: "The one icon-only control",
    },
  ],
  composition: { pattern: "compound", subComponents: ["Root"] },
  contract: {
    propsSummary: [
      "variant: solid|soft|ghost|link (default: solid)",
      "tone: solid accent|danger, soft and ghost neutral|danger (ink), link accent|neutral; the first is the default",
      "size: xs|sm|md|lg (default: md)",
      "pending: boolean - aria-busy, presses ignored, spinner after a second",
      "disabled: boolean - disables interaction",
      "type: button|submit|reset (default: button)",
      "onClick: (event) => void - action handler",
      "render: element | function - swaps the rendered element (anchor, router link)",
      "nativeButton: boolean - whether the rendered element is a native button",
    ],
    a11yRules: ["A11Y_BTN_LABEL", "A11Y_BTN_FOCUS"],
  },
});
