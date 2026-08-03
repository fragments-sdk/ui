import { defineFragment } from "@usefragments/core";
import { Dialog } from "./index";

export default defineFragment(Dialog, {
  meta: {
    name: "Dialog",
    purpose:
      "Modal overlay for focused user interactions. Use for confirmations, forms, or content requiring full attention.",
    category: "feedback",
    status: "stable",
    tags: ["modal", "dialog", "overlay", "popup", "confirmation"],
  },
  states: {
    Default: {
      render: (
        <Dialog defaultOpen>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Dialog title</Dialog.Title>
              <Dialog.Description>Focused supporting content.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>Dialog body</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close>Close</Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Basic dialog with header, body, and footer",
      canonical: true,
    },
    Confirmation: {
      render: (
        <Dialog defaultOpen>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete item?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>This action cannot be undone.</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close>Cancel</Dialog.Close>
              <Dialog.Close>Delete</Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Destructive action confirmation",
    },
    Large: {
      render: (
        <Dialog defaultOpen>
          <Dialog.Content size="lg">
            <Dialog.Header>
              <Dialog.Title>Detailed settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Complex content</Dialog.Body>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Large dialog for complex content",
    },
    "Link Trigger + No Initial Focus": {
      render: (
        <Dialog>
          <Dialog.Trigger asChild>
            <a href="#settings">Open settings</a>
          </Dialog.Trigger>
          <Dialog.Content initialFocus={false}>
            <Dialog.Header>
              <Dialog.Title>Settings</Dialog.Title>
              <Dialog.Description>Choose a settings area to edit.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>Settings content</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close>Close</Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Use asChild with a link trigger and disable automatic initial focus when needed",
    },
  },
  guidance: {
    when: [
      "Confirming destructive actions (delete, discard changes)",
      "Collecting focused input (forms, settings)",
      "Displaying content that requires acknowledgment",
      "Multi-step workflows that need isolation",
    ],
    whenNot: [
      "Simple tooltips or hints (use Tooltip)",
      "Contextual menus (use Menu or Popover)",
      "Non-blocking notifications (use Toast or Alert)",
      "Simple confirmation that can be inline (use Alert)",
    ],
    guidelines: [
      "Keep dialog content focused on a single task",
      "Provide clear primary and secondary actions",
      "Use descriptive title that explains the purpose",
      "Allow dismissal via backdrop click or close button for non-critical dialogs",
      "Trap focus within the dialog for accessibility",
      "Dialog.Trigger and Dialog.Close support asChild for buttons, links, and router link components",
    ],
    accessibility: [
      "Automatically traps focus within the dialog",
      "Closes on Escape key press",
      "Returns focus to trigger element on close",
      'Uses role="dialog" with proper aria attributes',
    ],
    dont: [
      {
        reason: "Do not use a Dialog for a non-blocking notification.",
        bad: "<Dialog>Saved</Dialog>",
        good: (
          <Dialog defaultOpen>
            <Dialog.Content>
              <Dialog.Body>Focused task</Dialog.Body>
            </Dialog.Content>
          </Dialog>
        ),
      },
    ],
  },
  matrix: {
    axes: { size: "auto", modal: ["true", "false"], theme: ["light", "dark"] },
    forced: ["open", "focus", "reduced-motion"],
    worstCase: {
      title:
        "A long localized dialog title that wraps while the close affordance remains reachable",
    },
  },
  preview: { providers: [], dynamicRegions: [] },
  relations: [
    {
      component: "Popover",
      relationship: "alternative",
      note: "Use Popover for non-modal contextual content",
    },
    { component: "Menu", relationship: "alternative", note: "Use Menu for action lists" },
    { component: "Alert", relationship: "sibling", note: "Use Alert for inline notifications" },
  ],
  composition: {
    pattern: "compound",
    subComponents: [
      "Trigger",
      "Content",
      "Close",
      "Header",
      "Title",
      "Description",
      "Body",
      "Footer",
    ],
    requiredChildren: ["Content"],
    commonPatterns: [
      '<Dialog><Dialog.Trigger><Button>Open</Button></Dialog.Trigger><Dialog.Content><Dialog.Header><Dialog.Title>{title}</Dialog.Title></Dialog.Header><Dialog.Body>{content}</Dialog.Body><Dialog.Footer><Dialog.Close><Button variant="secondary">Cancel</Button></Dialog.Close><Button>Confirm</Button></Dialog.Footer></Dialog.Content></Dialog>',
      '<Dialog><Dialog.Trigger asChild><a href="/settings">Open settings</a></Dialog.Trigger><Dialog.Content initialFocus={false}>...</Dialog.Content></Dialog>',
    ],
  },
  contract: {
    propsSummary: [
      "open: boolean - controlled open state",
      "onOpenChange: (open) => void - open state handler",
      "modal: boolean - blocks page interaction (default: true)",
      "Dialog.Content initialFocus?: boolean - control auto-focus on open (default: true)",
      "Dialog.Content size: sm|md|lg|xl|full - dialog width",
    ],
    a11yRules: ["A11Y_DIALOG_FOCUS", "A11Y_DIALOG_ESCAPE", "A11Y_DIALOG_LABEL"],
  },
});
