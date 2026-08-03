import { defineFragment } from "@usefragments/core";
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
    Danger: {
      render: <Button variant="danger">Delete item</Button>,
      note: "Destructive action requiring attention",
    },
    Disabled: {
      render: <Button disabled>Unavailable</Button>,
      note: "Non-interactive state",
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
        good: (
          <Button as="a" href="/settings">
            Settings
          </Button>
        ),
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
