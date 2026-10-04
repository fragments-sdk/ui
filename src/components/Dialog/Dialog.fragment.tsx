import { defineFragment } from "@usefragments/core";
import { Alert } from "../Alert";
import { Dialog } from "./index";
import { Button } from "../Button";

export default defineFragment(Dialog, {
  meta: {
    name: "Dialog",
    purpose: "Blocks the page with one focused task the user finishes or dismisses.",
    category: "overlays",
    status: "stable",
    tags: ["modal", "dialog", "overlay", "popup", "confirmation"],
  },
  states: {
    Default: {
      render: (
        <Dialog>
          <Dialog.Trigger render={<Button>Open dialog</Button>} />
          <Dialog.Content>
            <Dialog.Close />
            <Dialog.Header>
              <Dialog.Title>Dialog title</Dialog.Title>
              <Dialog.Description>Focused supporting content.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>Dialog body</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close render={<Button variant="ghost">Close</Button>} />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Header, body, and footer in the standard layout.",
      canonical: true,
    },
    Large: {
      render: (
        <Dialog>
          <Dialog.Trigger render={<Button>Open large dialog</Button>} />
          <Dialog.Content width="lg">
            <Dialog.Close />
            <Dialog.Header>
              <Dialog.Title>Detailed settings</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>Complex content</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close render={<Button variant="ghost">Close</Button>} />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Wider surface for denser content.",
    },
    "No Initial Focus": {
      render: (
        <Dialog>
          <Dialog.Trigger render={<Button variant="soft">Open settings</Button>} />
          <Dialog.Content initialFocus={false}>
            <Dialog.Header>
              <Dialog.Title>Settings</Dialog.Title>
              <Dialog.Description>Choose a settings area to edit.</Dialog.Description>
            </Dialog.Header>
            <Dialog.Body>Settings content</Dialog.Body>
            <Dialog.Footer>
              <Dialog.Close render={<Button variant="ghost">Close</Button>} />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "Skips autofocus when you place focus yourself.",
    },
    "Long Title": {
      render: (
        <Dialog>
          <Dialog.Trigger render={<Button>Open long title dialog</Button>} />
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
              <Dialog.Close render={<Button variant="ghost">Close</Button>} />
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      ),
      note: "A wrapping title keeps the close control reachable.",
    },
  },
  guidance: {
    when: [
      "Collecting input the user must finish in one pass",
      "Content that needs acknowledgment before continuing",
      "Isolating a step in a longer workflow",
    ],
    whenNot: [
      "A decision the user must answer, such as a destructive confirmation (use AlertDialog)",
      "A short hint (use Tooltip)",
      "A list of actions (use Menu)",
      "Contextual content that should not block (use Popover)",
      "Feedback the user does not act on (use Toast or Alert)",
    ],
    guidelines: [
      "One task per dialog",
      "Title states the task; body states the consequence",
      "Pair the primary action with an explicit cancel",
      "Escape and an outside press dismiss; for a destructive choice use AlertDialog",
      "Pass render={<Button />} to Dialog.Trigger — the bare trigger ships unstyled",
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
          <Alert tone="info">
            <Alert.Icon />
            <Alert.Body>
              <Alert.Title>Settings sync pending</Alert.Title>
              <Alert.Content>Changes reach every workspace within a minute.</Alert.Content>
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
    axes: { width: ["sm", "md", "lg"], theme: ["light", "dark"] },
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
    {
      component: "AlertDialog",
      relationship: "sibling",
      note: "Use AlertDialog for a decision the user must answer",
    },
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
      '<Dialog><Dialog.Trigger render={<Button />}>Open</Dialog.Trigger><Dialog.Content><Dialog.Header><Dialog.Title>{title}</Dialog.Title></Dialog.Header><Dialog.Body>{content}</Dialog.Body><Dialog.Footer><Dialog.Close render={<Button variant="ghost" />}>Cancel</Dialog.Close><Button>Confirm</Button></Dialog.Footer></Dialog.Content></Dialog>',
      '<Dialog><Dialog.Trigger render={<Button variant="soft" />}>Open settings</Dialog.Trigger><Dialog.Content initialFocus={false}>...</Dialog.Content></Dialog>',
    ],
  },
  contract: {
    propsSummary: [
      "open: boolean - controlled open state",
      "onOpenChange: (open) => void - open state handler",
      "Dialog.Content initialFocus?: boolean|ref|function - focus target on open (default: true)",
      "Dialog.Content finalFocus?: boolean|ref|function - focus target on close (default: true)",
      "Dialog.Content width: sm|md|lg - sheet width (default: md)",
      "Dialog.Trigger, Dialog.Close render: element - render a library control",
    ],
    a11yRules: ["A11Y_DIALOG_FOCUS", "A11Y_DIALOG_ESCAPE", "A11Y_DIALOG_LABEL"],
  },
});
