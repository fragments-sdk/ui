import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Gear, MagnifyingGlass } from "@phosphor-icons/react";
import { Box } from "../Box";
import { Button } from "../Button";
import { Card } from "../Card";
import { ColorPicker } from "../ColorPicker";
import { Combobox } from "../Combobox";
import { DatePicker } from "../DatePicker";
import { Grid } from "../Grid";
import { IconButton } from "../IconButton";
import { Input } from "../Input";
import { Select } from "../Select";
import { Stack } from "../Stack";
import { Tabs } from "../Tabs";
import { Text } from "../Text";
import { Textarea } from "../Textarea";
import { ToggleGroup } from "../ToggleGroup";
import styles from "./ControlSizing.module.scss";

const meta = {
  title: "Cloud/Control Sizing",
  parameters: {
    layout: "fullscreen",
    backgrounds: { default: "dark" },
    docs: {
      description: {
        component:
          "Cloud dogfood matrix for checking shared control heights across fields, buttons, pickers, tabs, and segmented controls.",
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;
type ControlSize = "sm" | "md" | "lg";

const sizes = [
  { size: "sm", expected: "32px" },
  { size: "md", expected: "40px" },
  { size: "lg", expected: "44px" },
] as const satisfies Array<{ size: ControlSize; expected: string }>;

const selectOptions = [
  { value: "all", label: "All statuses" },
  { value: "healthy", label: "Healthy" },
  { value: "blocked", label: "Blocked" },
];

function Sample({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap="xs" className={styles.sample}>
      <Text size="xs" color="tertiary" weight="medium">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

function SizeRow({ size, expected }: { size: ControlSize; expected: string }) {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap="lg"
      align="start"
      className={styles.sizeRow}
      data-size-row={size}
    >
      <Stack gap="xs" className={styles.sizeMeta}>
        <Text size="xs" color="tertiary" weight="medium">
          {size.toUpperCase()}
        </Text>
        <Text size="xs" color="secondary" font="mono">
          {expected}
        </Text>
      </Stack>

      <Grid
        columns="auto"
        minChildWidth="220px"
        gap="md"
        alignItems="start"
        className={styles.samples}
      >
        <Sample label="Input">
          <Input
            withFieldWrapper={false}
            size={size}
            placeholder="Search"
            startAdornment={<MagnifyingGlass size={14} />}
            rootProps={{ "data-control-size": size }}
          />
        </Sample>

        <Sample label="Button">
          <Button
            className={styles.control}
            size={size}
            variant="secondary"
            data-control-size={size}
          >
            Create PR
          </Button>
        </Sample>

        <Sample label="IconButton">
          <IconButton
            className={styles.compactControl}
            size={size}
            variant="outlined"
            aria-label="Settings"
            data-control-size={size}
          >
            <Gear />
          </IconButton>
        </Sample>

        <Sample label="Select">
          <Select
            className={styles.control}
            size={size}
            placeholder="Status"
            options={selectOptions}
          />
        </Sample>

        <Sample label="Combobox">
          <Combobox className={styles.control} size={size} placeholder="Repository">
            <Combobox.Input data-control-size={size} />
            <Combobox.Content>
              <Combobox.Item value="ui">fragments-sdk/ui</Combobox.Item>
              <Combobox.Item value="cloud">fragments/cloud</Combobox.Item>
            </Combobox.Content>
          </Combobox>
        </Sample>

        <Sample label="DatePicker">
          <DatePicker className={styles.control} size={size} placeholder="Last scanned">
            <DatePicker.Trigger data-control-size={size} />
            <DatePicker.Content>
              <DatePicker.Calendar />
            </DatePicker.Content>
          </DatePicker>
        </Sample>

        <Sample label="ColorPicker">
          <ColorPicker className={styles.control} size={size} value="#635bff" showInput />
        </Sample>

        <Sample label="Textarea">
          <Textarea
            className={styles.control}
            size={size}
            rows={1}
            resize="none"
            placeholder="Finding note"
          />
        </Sample>
      </Grid>
    </Stack>
  );
}

function SharedControls() {
  return (
    <Grid
      columns="auto"
      minChildWidth="220px"
      gap="md"
      alignItems="start"
      className={styles.samples}
    >
      <Sample label="Tabs">
        <Box className={styles.tabsSlot} data-control-size="sm">
          <Tabs defaultValue="findings" variant="pills">
            <Tabs.List>
              <Tabs.Tab value="findings">Findings</Tabs.Tab>
              <Tabs.Tab value="activity">Activity</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="findings" flush />
            <Tabs.Panel value="activity" flush />
          </Tabs>
        </Box>
      </Sample>

      <Sample label="ToggleGroup">
        <ToggleGroup defaultValue="all" size="sm" data-control-size="sm">
          <ToggleGroup.Item value="all">All</ToggleGroup.Item>
          <ToggleGroup.Item value="open">Open</ToggleGroup.Item>
          <ToggleGroup.Item value="closed">Closed</ToggleGroup.Item>
        </ToggleGroup>
      </Sample>
    </Grid>
  );
}

export const ControlSizing: Story = {
  render: () => (
    <Box className={styles.frame} padding="lg">
      <Stack gap="lg" className={styles.content}>
        <Stack gap="xs">
          <Text as="h1" size="xl" weight="semibold">
            Control sizing
          </Text>
          <Text color="secondary">
            Small controls share a 32px floor. Default and large controls align field and action
            heights through the same density scale.
          </Text>
        </Stack>

        <Card className={styles.section}>
          <Card.Body>
            <Stack gap="lg">
              {sizes.map((item) => (
                <SizeRow key={item.size} size={item.size} expected={item.expected} />
              ))}
            </Stack>
          </Card.Body>
        </Card>

        <Card className={styles.section}>
          <Card.Header>
            <Card.Title>Shared 32px controls</Card.Title>
            <Card.Description>
              Components without a full size scale still use the shared small-control rhythm.
            </Card.Description>
          </Card.Header>
          <Card.Body>
            <SharedControls />
          </Card.Body>
        </Card>
      </Stack>
    </Box>
  ),
};
