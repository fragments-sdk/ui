import type { Meta, StoryObj } from "@storybook/react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { VisuallyHidden } from ".";
import { Button } from "../Button";
import { Link } from "../Link";
import { Text } from "../Text";

/**
 * VisuallyHidden is the canonical screen-reader-only primitive. It hides content
 * visually while keeping it in the accessibility tree. With `focusable` it
 * reveals as a raised chip while it holds keyboard focus — the skip link.
 */
const meta = {
  title: "Navigation/VisuallyHidden",
  component: VisuallyHidden,
  tags: ["autodocs", "canonical"],
  parameters: {
    docs: {
      description: {
        component:
          "Hides content visually while keeping it accessible to screen readers. Prefer this over hand-rolled sr-only CSS for icon labels, supplementary text and skip links.",
      },
    },
  },
  argTypes: {
    as: {
      control: "select",
      options: ["span", "div"],
      description: "HTML element to render",
    },
    focusable: { control: "boolean", description: "Reveal while focus is inside" },
  },
  args: {
    children: "Search",
    as: "span",
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: "Search" },
};

export const IconButtonLabel: Story = {
  render: () => (
    <Button variant="ghost">
      <MagnifyingGlass aria-hidden />
      <VisuallyHidden>Search</VisuallyHidden>
    </Button>
  ),
};

export const SupplementaryText: Story = {
  render: () => (
    <Link href="#features">
      Read more
      <VisuallyHidden> about our accessibility features</VisuallyHidden>
    </Link>
  ),
};

/** Press Tab: the link reveals as a raised chip at the top corner. */
export const SkipLink: Story = {
  render: () => (
    <div>
      <VisuallyHidden focusable>
        <Link href="#main-content">Skip to main content</Link>
      </VisuallyHidden>
      <Text as="p" color="secondary">
        Press Tab to reveal the skip link.
      </Text>
      <main id="main-content" tabIndex={-1}>
        Main content
      </main>
    </div>
  ),
};

export const AsDiv: Story = {
  args: { as: "div", children: "Results updated" },
};
