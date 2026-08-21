import { defineFragment } from "@usefragments/core";
import { Link } from "../Link";
import { Stack } from "../Stack";
import { Button } from "./index";

export default defineFragment(Button, {
  meta: {
    name: "Button",
    purpose: "Triggers an action — save, submit, delete, open.",
    category: "forms",
    status: "stable",
    tags: ["action", "button", "form", "interactive"],
  },
  states: {
    Primary: {
      render: <Button variant="primary">Save changes</Button>,
      note: "The one action you want people to take here.",
      canonical: true,
    },
    Secondary: {
      render: <Button variant="secondary">Cancel</Button>,
      note: "Supporting action that sits beside the main one.",
    },
    Ghost: {
      render: <Button variant="ghost">Learn more</Button>,
      note: "No fill, no border — for dense toolbars and repeated rows.",
    },
    Link: {
      render: <Button variant="link">View all →</Button>,
      note: "Reads like a link, behaves like an action.",
    },
    Quiet: {
      render: (
        <Button variant="quiet" size="xs">
          Manage preferences
        </Button>
      ),
      note: "No box and no height floor, so it sits inline in meta lines.",
    },
    Danger: {
      render: <Button variant="danger">Delete item</Button>,
      note: "Destructive action people cannot undo.",
    },
    Outline: {
      render: <Button variant="outline">View details</Button>,
      note: "Bordered and transparent — reads over any surface.",
    },
    Icon: {
      render: (
        <Button variant="icon" aria-label="Add item">
          <span aria-hidden>+</span>
        </Button>
      ),
      note: "Square icon-only action. Always pass aria-label.",
    },
    Sizes: {
      render: (
        <Stack direction="row" gap="sm" align="center" wrap>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Stack>
      ),
      note: "xs for inline row actions, lg for hero calls to action.",
    },
    Disabled: {
      render: <Button disabled>Unavailable</Button>,
      note: "Blocks clicks and drops the button out of the tab order.",
    },
    "As Child": {
      render: (
        <Button asChild variant="outlined" aria-label="Open billing settings">
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
      note: "Long labels wrap instead of clipping or truncating.",
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
      "One primary button per form or section",
      "Danger for anything destructive",
      "Loading state must also disable the button",
      "With asChild, put interaction and a11y props on Button — they forward to the child",
      'variant="icon" for icon-only actions; or icon={true} plus another variant',
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
    axes: { variant: "auto", size: "auto", theme: ["light", "dark"] },
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
      "variant: primary|secondary|ghost|link|quiet|danger|outlined|outline|icon (default: primary, icon = outlined + icon-only, link = accent transparent, quiet = neutral text button, no box)",
      "size: xs|sm|md|lg (default: md, xs for inline row-action controls)",
      "disabled: boolean - disables interaction",
      "type: button|submit|reset (default: button)",
      "onClick: (event) => void - action handler",
      "asChild: boolean - composes styles/props onto a child element (links/router links)",
      "icon: boolean - icon-only square layout (can be combined with visual variants)",
    ],
    a11yRules: ["A11Y_BTN_LABEL", "A11Y_BTN_FOCUS"],
  },
});
