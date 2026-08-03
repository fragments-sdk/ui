import { defineFragment } from "@usefragments/core";
import { Card } from "./index";

export default defineFragment(Card, {
  meta: {
    name: "Card",
    purpose: "Container for grouping related content",
    category: "layout",
    status: "stable",
    tags: ["container", "layout", "surface"],
  },
  states: {
    Default: {
      render: (
        <Card>
          <Card.Body>Related content</Card.Body>
        </Card>
      ),
      note: "Standard quiet card surface",
      canonical: true,
    },
    Outlined: {
      render: (
        <Card variant="outlined">
          <Card.Body>Related content</Card.Body>
        </Card>
      ),
      note: "Card with border instead of shadow",
    },
    Elevated: {
      render: (
        <Card variant="elevated">
          <Card.Body>Related content</Card.Body>
        </Card>
      ),
      note: "Card with prominent shadow for emphasis",
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
      note: "Dashboard panel with a divided header and body-owned spacing",
    },
  },
  guidance: {
    when: [
      "Grouping related pieces of content together",
      "Creating visual separation between content sections",
      "Displaying a preview or summary of an item",
      "Building dashboard widgets or tiles",
    ],
    whenNot: [
      "Simple text content that does not need grouping",
      "Modal or dialog content (use Dialog component)",
      "Navigation items (use List or Sidebar patterns)",
    ],
    guidelines: [
      "Use consistent card variants within the same context",
      "Cards in a grid should have uniform sizing",
      "Use elevated variant sparingly for emphasis",
      "Use stat and panel variants for dashboard surfaces so spacing, border, and radius stay consistent",
      "If a card is clickable, provide clear hover/focus affordances and prefer explicit buttons/links inside the card",
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
