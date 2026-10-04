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
    Metric: {
      render: (
        <Card>
          <Card.Body>
            <Text as="p" type="display" tabularNums>
              94%
            </Text>
            <Text as="p" color="secondary">
              Component coverage
            </Text>
          </Card.Body>
        </Card>
      ),
      note: "A metric tile is the same surface: the figure on the display step, tabular.",
    },
    Panel: {
      render: (
        <Card padding="none">
          <Card.Header divided>
            <Card.Title>Overview</Card.Title>
          </Card.Header>
          <Card.Body padding="md">Panel content</Card.Body>
        </Card>
      ),
      note: "A 40px divided head with the line below and no fill; the body owns its own spacing.",
    },
    "Danger Tone": {
      render: (
        <Card tone="danger">
          <Card.Header>
            <Card.Title>Merge held</Card.Title>
            <Card.Description>Two blocking findings need a decision.</Card.Description>
          </Card.Header>
        </Card>
      ),
      note: "The only state chrome: the edge in the danger ink, no wash.",
    },
    Interactive: {
      render: (
        <Card render={<a href="#details" />}>
          <Card.Header>
            <Card.Title>Open details</Card.Title>
            <Card.Description>The whole card is one link</Card.Description>
          </Card.Header>
        </Card>
      ),
      note: "render makes the card a real link or button: gated hover tint, press scale, focus ring. Inside a button the parts draw as spans.",
    },
    Selected: {
      render: (
        <Card selected render={<button type="button" aria-pressed="true" />}>
          <Card.Header>
            <Card.Title>Team plan</Card.Title>
            <Card.Description>Chosen</Card.Description>
          </Card.Header>
        </Card>
      ),
      note: "The chosen card: the selection wash, and the hairline turns into the ring.",
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
        <Card padding="none">
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
      "One surface: the surface plane, the hairline, the surface corner, no shadow",
      "Cards sharing a grid row should size uniformly",
      'tone="danger" is the only state chrome; put other state in a Badge or Alert inside',
      'padding="none" plus Card.Header divided and Card.Body padding is the panel',
      "A feature mosaic is Grid.Item colSpan and rowSpan around a Card",
      "Prefer a Button or Link inside the card; when the whole card acts, pass render",
    ],
    accessibility: [
      "Card is a semantic container (article/div/section); render={<a href />} or render={<button />} makes it one real interactive element",
      "A selected card pairs selected with aria-pressed on a button or aria-current on a link",
      "Card titles should be appropriate heading levels",
    ],
    dont: [
      {
        reason: "Do not use a Card as a modal surface.",
        bad: "<Card>Confirm deletion</Card>",
        good: (
          <Card>
            <Card.Body>Inline summary</Card.Body>
          </Card>
        ),
      },
    ],
  },
  matrix: {
    axes: { tone: "auto", padding: "auto", theme: ["light", "dark"] },
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
      "tone: neutral|danger (default: neutral) - danger draws the edge in the danger ink",
      "padding: none|md (default: md) - md is the compact inset (12); none + Card.Header divided + Card.Body padding = panel",
      "selected: boolean - the selection wash and ring",
      "as: article|div|section (default: article) - static card root element",
      "render: ReactElement - a real link or button for an interactive card",
      "Sub-components: Card.Header, Card.Title, Card.Description, Card.Body, Card.Footer",
      "Card.Body padding: none|md - use for panel body spacing",
    ],
    a11yRules: ["A11Y_CARD_HEADING", "A11Y_CARD_INTERACTIVE"],
  },
});
