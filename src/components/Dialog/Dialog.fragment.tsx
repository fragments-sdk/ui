import { defineFragment } from "@usefragments/core";
import { Alert } from "../Alert";
import { Dialog } from "./index";
import { Button } from "../Button";

export default defineFragment(Dialog, {
  meta: {
    name: "Dialog",
    purpose: "Blocks the page with one focused task the user must finish or dismiss.",
    category: "feedback",
    status: "stable",
    tags: ["modal", "dialog", "overlay", "popup", "confirmation"],
  },
  states: {
    Default: {
      render: (
        <Dialog>
          <Dialog.Trigger asChild>
            <Button>Open dialog</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Close />
            <Dialog.Header>
              <Dialog.Title>Dialog title</Dialog.Title>
              <Dialog.Description>Focused supporting content.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>Dialog body</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="secondary">Close</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Header, body, and footer in the standard layout.",
      canonical: true,
    },
    Confirmation: {
      render: (
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant="danger">Delete item</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete item?</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>This action cannot be undone.</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="secondary">Cancel</Button>
              </Dialog.Close>
              <Dialog.Close asChild>
                <Button variant="danger">Delete</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Names the consequence before an irreversible action.",
    },
    Large: {
      render: (
        <Dialog>
          <Dialog.Trigger asChild>
            <Button>Open large dialog</Button>
          </Dialog.Trigger>
          <Dialog.Content size="lg">
            <Dialog.Close />
            <Dialog.Header>
              <Dialog.Title>Detailed settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Complex content</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="secondary">Close</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Wider surface for denser content.",
    },
    "No Initial Focus": {
      render: (
        <Dialog>
          <Dialog.Trigger asChild>
            <Button variant="secondary">Open settings</Button>
          </Dialog.Trigger>
          <Dialog.Content initialFocus={false}>
            <Dialog.Header>
              <Dialog.Title>Settings</Dialog.Title>
              <Dialog.Description>Choose a settings area to edit.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>Settings content</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="secondary">Close</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Skips autofocus when you place focus yourself.",
    },
    "Long Title": {
      render: (
        <Dialog>
          <Dialog.Trigger asChild>
            <Button>Open long title dialog</Button>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Close />
            <Dialog.Header>
              <Dialog.Title>
                Confirm the localized account recovery policy for every workspace administrator
              </Dialog.Title>
              <Dialog.Description>
                The title wraps while the close affordance and recovery action remain reachable.
              </Dialog.Description>
            </Dialog.Header>
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="secondary">Close</Button>
              </Dialog.Close>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "A wrapping title keeps the close control reachable.",
    },
  },
  guidance: {
    when: [
      "Confirming something irreversible",
      "Collecting input the user must finish in one pass",
      "Content that needs acknowledgment before continuing",
      "Isolating a step in a longer workflow",
    ],
    whenNot: [
      "A short hint (use Tooltip)",
      "A list of actions (use Menu)",
      "Contextual content that should not block (use Popover)",
      "Feedback the user does not act on (use Toast or Alert)",
    ],
    guidelines: [
      "One task per dialog",
      "Title states the task; body states the consequence",
      "Pair the primary action with an explicit cancel",
      "Leave backdrop and Escape dismissal on unless the choice is destructive",
      "Wrap the trigger with asChild around a real control — the bare trigger ships unstyled",
    ],
    accessibility: [
      "Traps focus while open",
      "Escape closes",
      "Focus returns to the trigger on close",
      'role="dialog" with title and description wired to aria attributes',
    ],
    dont: [
      {
        reason: "Do not use a Dialog for a non-blocking notification.",
        bad: "<Dialog>Saved</Dialog>",
        good: (
          <Alert severity="success">
            <Alert.Icon />
            <Alert.Body>
              <Alert.Title>Changes saved</Alert.Title>
              <Alert.Content>Your settings are up to date.</Alert.Content>
            </Alert.Body>
          </Alert>
        ),
      },
      {
        reason: "Do not omit an accessible title and explicit close action from a Dialog.",
        bad: "<Dialog><Dialog.Content>Focused task</Dialog.Content></Dialog>",
        good: (
          <Dialog defaultOpen>
            <Dialog.Content>
              <Dialog.Title>Account settings</Dialog.Title>
              <Dialog.Body>Update your workspace preferences.</Dialog.Body>
              <Dialog.Close>Close</Dialog.Close>
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
      '<Dialog><Dialog.Trigger asChild><Button>Open</Button></Dialog.Trigger><Dialog.Content><Dialog.Header><Dialog.Title>{title}</Dialog.Title></Dialog.Header><Dialog.Body>{content}</Dialog.Body><Dialog.Footer><Dialog.Close asChild><Button variant="secondary">Cancel</Button></Dialog.Close><Button>Confirm</Button></Dialog.Footer></Dialog.Content></Dialog>',
      '<Dialog><Dialog.Trigger asChild><Button variant="secondary">Open settings</Button></Dialog.Trigger><Dialog.Content initialFocus={false}>...</Dialog.Content></Dialog>',
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
