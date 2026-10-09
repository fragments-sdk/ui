import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { FilterBar } from ".";
import { Select } from "../Select";

/**
 * FilterBar lays labelled filters on one line and folds them behind one
 * button when the line no longer fits: a popover from `sm` up, a bottom sheet
 * below it.
 */
const meta = {
  title: "Forms/FilterBar",
  component: FilterBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Labelled filters on one line that fold behind one button, in a popover or a bottom sheet, when they no longer fit.",
      },
    },
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

const OWNERS = ["All owners", "Alex Santos", "Grace Miller", "Noah Lee"];
const STAGES = ["Any", "Pilot", "Enterprise", "Expansion"];
const ACTIVITY = ["7 days", "30 days", "90 days"];

function Choice(props: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <Select size="sm" value={props.value} onValueChange={(value) => props.onChange(String(value))}>
      <Select.Trigger />
      <Select.Content>
        {props.options.map((option) => (
          <Select.Item key={option} value={option}>
            {option}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
}

function Filters({ collapse }: { collapse?: React.ComponentProps<typeof FilterBar>["collapse"] }) {
  const [owner, setOwner] = React.useState(OWNERS[0]);
  const [stage, setStage] = React.useState(STAGES[0]);
  const [activity, setActivity] = React.useState("90 days");
  const active =
    Number(owner !== OWNERS[0]) + Number(stage !== STAGES[0]) + Number(activity !== "90 days");
  return (
    <FilterBar
      size="sm"
      collapse={collapse}
      activeCount={active}
      onReset={() => {
        setOwner(OWNERS[0]);
        setStage(STAGES[0]);
        setActivity("90 days");
      }}
      doneLabel="Show results"
    >
      <FilterBar.Item label="Owner">
        <Choice options={OWNERS} value={owner} onChange={setOwner} />
      </FilterBar.Item>
      <FilterBar.Item label="Stage">
        <Choice options={STAGES} value={stage} onChange={setStage} />
      </FilterBar.Item>
      <FilterBar.Item label="Last activity">
        <Choice options={ACTIVITY} value={activity} onChange={setActivity} />
      </FilterBar.Item>
    </FilterBar>
  );
}

/** Room for the line: each label sits before its control. Narrow the canvas to watch it fold. */
export const Default: Story = {
  render: () => <Filters />,
};

/** Folded: one button counts the active filters and opens them with Reset and Done. */
export const Folded: Story = {
  render: () => <Filters collapse="always" />,
};

/** In a narrow column the bar folds on its own; below `sm` the filters open in a bottom sheet. */
export const NarrowRoom: Story = {
  render: () => (
    <div style={{ inlineSize: 280 }}>
      <Filters />
    </div>
  ),
};
