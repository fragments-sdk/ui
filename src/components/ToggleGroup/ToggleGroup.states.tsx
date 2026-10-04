/**
 * State fixtures for ToggleGroup, rendered by `pnpm run test:states`.
 *
 * @family:actions
 * @na:empty A segmented control always has its segments.
 * @na:loading Segments are static choices; nothing loads.
 * @na:error A segmented control always holds a valid choice.
 */
import { Monitor, Moon, Sun } from "@phosphor-icons/react";
import { Stack } from "../Stack";
import { ToggleGroup } from ".";

export function populated() {
  return (
    <Stack gap="md" align="start">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <ToggleGroup key={size} aria-label={`Range, ${size}`} size={size} defaultValue="week">
          <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
          <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
          <ToggleGroup.Item value="month">Month</ToggleGroup.Item>
        </ToggleGroup>
      ))}
      <ToggleGroup aria-label="Colour mode" size="sm" defaultValue="system">
        <ToggleGroup.Item value="system">
          <Monitor aria-hidden />
          System
        </ToggleGroup.Item>
        <ToggleGroup.Item value="light">
          <Sun aria-hidden />
          Light
        </ToggleGroup.Item>
        <ToggleGroup.Item value="dark">
          <Moon aria-hidden />
          Dark
        </ToggleGroup.Item>
      </ToggleGroup>
      <ToggleGroup aria-label="Formatting" multiple defaultValue={["bold", "italic"]}>
        <ToggleGroup.Item value="bold">Bold</ToggleGroup.Item>
        <ToggleGroup.Item value="italic">Italic</ToggleGroup.Item>
        <ToggleGroup.Item value="underline">Underline</ToggleGroup.Item>
      </ToggleGroup>
    </Stack>
  );
}

export function overflow() {
  return (
    <Stack gap="md" style={{ inlineSize: 280 }}>
      <ToggleGroup aria-label="Status" defaultValue="all">
        <ToggleGroup.Item value="all">Every finding in the repository</ToggleGroup.Item>
        <ToggleGroup.Item value="open">Open</ToggleGroup.Item>
      </ToggleGroup>
      <ToggleGroup aria-label="Plan" fullWidth defaultValue="monthly">
        <ToggleGroup.Item value="monthly">Monthly billing for the team</ToggleGroup.Item>
        <ToggleGroup.Item value="yearly">Yearly</ToggleGroup.Item>
      </ToggleGroup>
    </Stack>
  );
}

export function lifecycle() {
  return (
    <Stack gap="md" align="start">
      <ToggleGroup aria-label="Range" defaultValue="week">
        <ToggleGroup.Item value="day" data-states-interact="hover">
          Day
        </ToggleGroup.Item>
        <ToggleGroup.Item value="week" data-states-interact="focus">
          Week
        </ToggleGroup.Item>
        <ToggleGroup.Item value="month" disabled>
          Month
        </ToggleGroup.Item>
      </ToggleGroup>
      <ToggleGroup aria-label="Range, disabled" disabled defaultValue="week">
        <ToggleGroup.Item value="day">Day</ToggleGroup.Item>
        <ToggleGroup.Item value="week">Week</ToggleGroup.Item>
      </ToggleGroup>
    </Stack>
  );
}
