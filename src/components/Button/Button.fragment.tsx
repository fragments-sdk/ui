import { defineFragment } from "@usefragments/core";
import { Link } from "../Link";
import { Button } from "./index";

export default defineFragment(Button, {
  meta: {
    name: "Button",
    purpose: "Interactive element for user actions and form submissions",
    category: "forms",
    status: "stable",
    tags: ["action", "button", "form", "interactive"],
  },
  states: {
    Primary: {
      render: <Button variant="primary">Save changes</Button>,
      note: "Default action button for primary actions",
      canonical: true,
    },
    Secondary: {
      render: <Button variant="secondary">Cancel</Button>,
      note: "Less prominent action button",
    },
    Ghost: {
      render: <Button variant="ghost">Learn more</Button>,
      note: "Minimal visual weight for subtle actions",
    },
    Link: {
      render: <Button variant="link">View all →</Button>,
      note: "Accent-coloured transparent button for tertiary CTAs",
    },
    Quiet: {
      render: <Button variant="quiet" size="xs">Manage preferences</Button>,
      note: "Neutral text button with no box and no height floor, for meta lines and footnotes",
    },
    Danger: {
      render: <Button variant="danger">Delete item</Button>,
      note: "Destructive action requiring attention",
    },
    Outline: {
      render: <Button variant="outline">View details</Button>,
      note: "Bordered button with transparent background",
    },
    Icon: {
      render: (
        <Button variant="icon" aria-label="Add item">
          <span aria-hidden>+</span>
        </Button>
      ),
      note: "Convenience icon-only button alias (ghost + square icon sizing)",
    },
    Sizes: {
      render: (
        <div>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </div>
      ),
      note: "Available size options",
    },
    Disabled: {
      render: <Button disabled>Unavailable</Button>,
      note: "Non-interactive state",
    },
    "As Child": {
      render: (
        <Button asChild variant="outlined" aria-label="Open billing settings">
          <a href="#billing-settings">Billing settings</a>
        </Button>
      ),
      note: "Compose button styles onto another interactive element while preserving forwarded props",
    },
    "Long Label": {
      render: (
        <Button>
          Save the localized account preferences and notify every affected workspace administrator
        </Button>
      ),
      note: "Long localized action labels wrap without hiding the action",
    },
  },
  guidance: {
    when: [
      "Triggering an action (save, submit, delete, etc.)",
      "Form submission",
      "Opening dialogs or menus",
      "Navigation when action context is needed",
    ],
    whenNot: [
      "Simple navigation (use Link)",
      "Toggling state (use Switch or Checkbox)",
      "Selecting from options (use Select or RadioGroup)",
    ],
    guidelines: [
      "Use Primary for the main action in a context",
      "Only one Primary button per section/form",
      "Use Danger variant for destructive actions",
      "Loading state should disable the button",
      "When using asChild, pass interaction and accessibility props directly on Button (they are forwarded to the child element)",
      'Use variant="icon" for the default icon-only action button, or combine icon={true} with another visual variant when needed',
    ],
    accessibility: [
      "Button text should describe the action",
      'Avoid generic labels like "Click here"',
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
