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
      note: "Supporting action that sits beside the main one. Neutral tone by default.",
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
    Tones: {
      render: (
        <Stack direction="row" gap="sm" align="center" wrap>
          <Button variant="soft" tone="accent">
            Accent
          </Button>
          <Button variant="soft" tone="info">
            Info
          </Button>
          <Button variant="soft" tone="success">
            Success
          </Button>
          <Button variant="soft" tone="warning">
            Warning
          </Button>
          <Button variant="soft" tone="danger">
            Danger
          </Button>
        </Stack>
      ),
      note: "Tone is colour and colour is meaning; it works on every variant.",
    },
    Outline: {
      render: <Button variant="outline">View details</Button>,
      note: "Bordered and transparent — reads over any surface.",
    },
    Icon: {
      render: (
        <Button icon variant="outline" aria-label="Add item">
          <span aria-hidden>+</span>
        </Button>
      ),
      note: "Square icon-only action. Always pass aria-label.",
    },
    Sizes: {
      render: (
        <Stack direction="row" gap="sm" align="center" wrap>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Stack>
      ),
      note: "sm for inline row actions, lg for hero calls to action.",
    },
    Disabled: {
      render: <Button disabled>Unavailable</Button>,
      note: "Blocks clicks and drops the button out of the tab order.",
    },
    "As Child": {
      render: (
        <Button asChild variant="outline" aria-label="Open billing settings">
          <a href="#billing-settings">Billing settings</a>
        </Button>
      ),
      note: "Paints button styles onto an anchor or router link; props forward to the child.",
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
      "Loading state must also disable the button",
      "With asChild, put interaction and a11y props on Button — they forward to the child",
      "icon={true} with any variant for icon-only actions",
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
      note: "Use Icon inside Button for icon-leading/trailing or icon-only actions",
    },
    {
      component: "ButtonGroup",
      relationship: "parent",
      note: "Use ButtonGroup for related action sets",
    },
  ],
  composition: { pattern: "compound", subComponents: ["Root"] },
  contract: {
    propsSummary: [
      "variant: solid|soft|outline|ghost|link (default: solid)",
      "tone: neutral|accent|info|success|warning|danger (default: accent on solid/link, neutral on soft/outline/ghost)",
      "size: sm|md|lg (default: md)",
      "disabled: boolean - disables interaction",
      "type: button|submit|reset (default: button)",
      "onClick: (event) => void - action handler",
      "asChild: boolean - composes styles/props onto a child element (links/router links)",
      "icon: boolean - icon-only square layout (can be combined with visual variants)",
    ],
    a11yRules: ["A11Y_BTN_LABEL", "A11Y_BTN_FOCUS"],
  },
});
