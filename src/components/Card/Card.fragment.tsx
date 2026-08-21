import { defineFragment } from "@usefragments/core";
import { Text } from "../Text";
import { Card } from "./index";

export default defineFragment(Card, {
  meta: {
    name: "Card",
    purpose: "Groups related content onto one bounded surface.",
    category: "layout",
    status: "stable",
    tags: ["container", "layout", "surface"],
  },
  states: {
    Default: {
      render: (
        <Card>
          <Card.Header>
            <Card.Title>Card title</Card.Title>
            <Card.Description>A brief description</Card.Description>
          </Card.Header>
          <Card.Body>Related content</Card.Body>
        </Card>
      ),
      note: "Quiet surface with a title and description.",
      canonical: true,
    },
    "Content Only": {
      render: (
        <Card>
          <Card.Body>Just content, no header or footer.</Card.Body>
        </Card>
      ),
      note: "Body alone, when there is nothing to title.",
    },
    "With Footer": {
      render: (
        <Card>
          <Card.Header>
            <Card.Title>Card with footer</Card.Title>
            <Card.Description>Complete card layout</Card.Description>
          </Card.Header>
          <Card.Body>Main content area.</Card.Body>
          <Card.Footer>Footer actions go here</Card.Footer>
        </Card>
      ),
      note: "Footer parks the actions below the content.",
    },
    Outlined: {
      render: (
        <Card variant="outlined">
          <Card.Body>Related content</Card.Body>
        </Card>
      ),
      note: "Border instead of shadow, for dense layouts.",
    },
    Elevated: {
      render: (
        <Card variant="elevated">
          <Card.Body>Related content</Card.Body>
        </Card>
      ),
      note: "Heavier shadow pulls one surface forward.",
    },
    Stat: {
      render: (
        <Card variant="stat">
          <Card.Body>
            <Text size="xl" weight="semibold">
              94%
            </Text>
            <Text size="sm" color="secondary">
              Component coverage
            </Text>
          </Card.Body>
        </Card>
      ),
      note: "Compact metric tile for dashboard grids.",
    },
    Panel: {
      render: (
        <Card variant="panel">
          <Card.Header divided>
            <Card.Title>Overview</Card.Title>
          </Card.Header>
          <Card.Body padding="md">Panel content</Card.Body>
        </Card>
      ),
      note: "Divided header; the body owns its own spacing.",
    },
    Interactive: {
      render: (
        <Card as="section" onClick={() => undefined}>
          <Card.Header>
            <Card.Title>Open details</Card.Title>
            <Card.Description>This card is interactive</Card.Description>
          </Card.Header>
          <Card.Body>Activate the card to view more.</Card.Body>
        </Card>
      ),
      note: "onClick adds keyboard and button behaviour to the whole surface.",
    },
    "Section Root": {
      render: (
        <Card as="section" aria-labelledby="billing-card-title">
          <Card.Header>
            <Card.Title id="billing-card-title">Billing summary</Card.Title>
          </Card.Header>
          <Card.Body>Section semantics support the surrounding document outline.</Card.Body>
        </Card>
      ),
      note: "The as prop matches the surrounding document semantics.",
    },
    "Nested Heading": {
      render: (
        <Card variant="panel" padding="none">
          <Card.Header divided>
            <Card.Title as="h4">Nested panel</Card.Title>
          </Card.Header>
          <Card.Body padding="md">Panel content</Card.Body>
        </Card>
      ),
      note: "Pick the heading level the page outline expects.",
    },
    "Long Content": {
      render: (
        <Card>
          <Card.Header>
            <Card.Title>
              A detailed localized account recovery policy for administrators across multiple
              workspaces
            </Card.Title>
            <Card.Description>
              Supporting content remains readable when translated strings take substantially more
              space than the English source.
            </Card.Description>
          </Card.Header>
          <Card.Body>
            Recovery settings apply to every affected administrator and retain an auditable history
            of the notification decision.
          </Card.Body>
        </Card>
      ),
      note: "Long titles and dense text wrap without breaking the surface.",
    },
  },
  guidance: {
    when: [
      "Grouping related content behind one boundary",
      "Previews, summaries, and dashboard tiles",
      "Separating sections that spacing alone cannot",
    ],
    whenNot: [
      "Plain text that needs no grouping",
      "Modal surfaces (use Dialog)",
      "Navigation items (use List or Sidebar)",
    ],
    guidelines: [
      "Keep one variant per context — mixed variants read as noise",
      "Cards sharing a grid row should size uniformly",
      "elevated is for emphasis; use it on one card, not all of them",
      "stat and panel keep dashboard spacing, border, and radius consistent",
      "outline is an alias for outlined — either spelling works",
      "Prefer a Button or Link inside the card over making the whole card clickable",
    ],
    accessibility: [
      'Card is a semantic container (article/div/section); onClick adds keyboard and role="button" behavior, but explicit Button or Link actions are preferred',
      "Card titles should be appropriate heading levels",
    ],
    dont: [
      {
        reason: "Do not use a Card as a modal surface.",
        bad: "<Card>Confirm deletion</Card>",
        good: (
          <Card variant="outlined">
            <Card.Body>Inline summary</Card.Body>
          </Card>
        ),
      },
    ],
  },
  matrix: {
    axes: { variant: "auto", padding: "auto", theme: ["light", "dark"] },
    forced: ["hover", "focus"],
    worstCase: { children: "A long localized heading and dense multi-line supporting content" },
  },
  preview: { providers: [], dynamicRegions: [] },
  relations: [
    {
      component: "Grid",
      relationship: "parent",
      note: "Use Grid + Card for responsive card layouts",
    },
    {
      component: "List",
      relationship: "alternative",
      note: "Use List for linear, text-first layouts",
    },
  ],
  composition: {
    pattern: "compound",
    subComponents: ["Header", "Title", "Description", "Body", "Footer"],
    requiredChildren: ["Body"],
    commonPatterns: [
      "<Card><Card.Body>{content}</Card.Body></Card>",
      "<Card><Card.Header><Card.Title>{title}</Card.Title></Card.Header><Card.Body>{content}</Card.Body></Card>",
      "<Card><Card.Header><Card.Title>{title}</Card.Title><Card.Description>{desc}</Card.Description></Card.Header><Card.Body>{content}</Card.Body><Card.Footer>{actions}</Card.Footer></Card>",
    ],
  },
  contract: {
    propsSummary: [
      "variant: default|outlined|outline|elevated|stat|panel (default: default)",
      "padding: none|sm|md|lg (default: md)",
      "as: article|div|section (default: article) - card root element",
      "onClick: (event) => void - click handler on root (adds role/button keyboard behavior)",
      "Sub-components: Card.Header, Card.Title, Card.Description, Card.Body, Card.Footer",
      "Card.Body padding: none|sm|md|lg - use for panel body spacing",
    ],
    a11yRules: ["A11Y_CARD_HEADING", "A11Y_CARD_INTERACTIVE"],
  },
});
