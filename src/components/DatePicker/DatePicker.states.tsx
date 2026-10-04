/**
 * State fixtures for DatePicker, rendered by `pnpm run test:states`.
 *
 * @family:pickers
 * @na:empty A calendar always shows a month; an unset value shows the placeholder (populated shows the set one).
 * @na:loading Dates are computed in the browser; the calendar keeps its six-week footprint as a skeleton while its dependency resolves.
 */
import { DatePicker } from ".";
import {
  anchorGap,
  find,
  framesUntil,
  near,
  recorder,
  popupSettled,
  stillPopupChecks,
} from "../../test/recipe-checks";
import { TokenChecks, type Check } from "../../test/token-probe";

const DAY = new Date(2026, 9, 3);

function popup() {
  return document.querySelector<HTMLElement>("[data-states-calendar]");
}

export function populated() {
  return (
    <DatePicker label="Start date" defaultValue={DAY} placeholder="Pick a date">
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  );
}

async function checkOpen(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  const opened = await framesUntil(() => Boolean(popup()));
  add("The calendar opens", opened < 0 ? "never" : `after ${opened} frame(s)`, opened >= 0);
  const calendar = popup();
  if (!calendar) return checks;
  await popupSettled(calendar);
  checks.push(...stillPopupChecks("The calendar", calendar));
  const { side, gap } = anchorGap(calendar, find(host, "button[aria-haspopup], button"));
  add("The calendar sits 4 from its trigger", `${gap.toFixed(2)}px (${side})`, near(gap, 4, 0.5));
  return checks;
}

export function lifecycleOpen() {
  return (
    <TokenChecks title="Open calendar" check={checkOpen}>
      <DatePicker label="Start date" defaultValue={DAY} open>
        <DatePicker.Trigger />
        <DatePicker.Content data-states-calendar="">
          <DatePicker.Calendar />
        </DatePicker.Content>
      </DatePicker>
    </TokenChecks>
  );
}

export function error() {
  return (
    <DatePicker
      label="Start date"
      placeholder="Pick a start date"
      invalid
      errorMessage="Pick a start date before the end date"
    >
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <DatePicker
        label="Window"
        mode="range"
        defaultValue={{ from: new Date(2026, 8, 28), to: new Date(2026, 11, 31) }}
      >
        <DatePicker.Trigger />
        <DatePicker.Content>
          <DatePicker.Calendar />
        </DatePicker.Content>
      </DatePicker>
    </div>
  );
}

export function lifecycleReadOnly() {
  return (
    <DatePicker label="Start date" defaultValue={DAY} readOnly>
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  );
}

export function lifecycleDisabled() {
  return (
    <DatePicker label="Start date" defaultValue={DAY} disabled>
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  );
}
