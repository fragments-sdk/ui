/**
 * State fixtures for ThinkingIndicator, rendered by `pnpm run test:states`.
 *
 * @family:ai
 * @na:empty The indicator always says what the assistant is doing.
 */
import { ThinkingIndicator } from ".";
import { Stack } from "../Stack";
import { find, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, type Check } from "../../test/token-probe";

function Plan({ active = true }: { active?: boolean }) {
  return (
    <ThinkingIndicator active={active} label="Checking the contract…" doneLabel="Checked">
      <ThinkingIndicator.Steps label="Plan" foldable>
        <ThinkingIndicator.Step label="Read the contract" status="complete" />
        <ThinkingIndicator.Step label="Scan changed files" status={active ? "pending" : "complete"}>
          12 of 40 files
        </ThinkingIndicator.Step>
        <ThinkingIndicator.Step label="Write the summary" status={active ? "idle" : "complete"} />
      </ThinkingIndicator.Steps>
    </ThinkingIndicator>
  );
}

async function checkWorking(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const row = find(host, "[data-active] > div");
  const after = getComputedStyle(row, "::after");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  add("The row carries the work wash", after.backgroundColor, after.content !== "none");
  add(
    reduced ? "The sweep holds still under reduced motion" : "The sweep runs",
    after.animationName,
    reduced ? after.animationName === "none" : /working-sweep/.test(after.animationName)
  );
  add(
    "The label is a status that says what is happening",
    find(host, '[role="status"]').textContent ?? "",
    /Checking the contract/.test(find(host, '[role="status"]').textContent ?? "")
  );
  return checks;
}

export function loading() {
  return (
    <TokenChecks title="Working" check={checkWorking}>
      <Plan />
    </TokenChecks>
  );
}

export function loadingReducedMotion() {
  return (
    <TokenChecks title="Working under reduced motion" check={checkWorking}>
      <Plan />
    </TokenChecks>
  );
}

export function populated() {
  return (
    <TokenChecks
      title="Finished"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        const text = find(host, '[role="status"]').textContent ?? "";
        add("The row stays and says it finished", text, text === "Checked");
        add(
          "No wash once work stops",
          String(host.querySelector("[data-active]")),
          host.querySelector("[data-active]") === null
        );
        return checks;
      }}
    >
      <Plan active={false} />
    </TokenChecks>
  );
}

export function error() {
  return (
    <ThinkingIndicator active={false} doneLabel="Stopped">
      <ThinkingIndicator.Steps>
        <ThinkingIndicator.Step label="Read the contract" status="complete" />
        <ThinkingIndicator.Step label="Fetch the pull request" status="error">
          GitHub did not answer
        </ThinkingIndicator.Step>
      </ThinkingIndicator.Steps>
    </ThinkingIndicator>
  );
}

export function overflow() {
  return (
    <div style={{ inlineSize: 240 }}>
      <ThinkingIndicator
        showElapsed
        label="Reading every changed file in the repository and comparing it to the contract…"
      >
        <ThinkingIndicator.Steps>
          <ThinkingIndicator.Step
            label="Scan packages/engine/src/compiler/core/loader.ts and every file it imports"
            status="pending"
          />
        </ThinkingIndicator.Steps>
      </ThinkingIndicator>
    </div>
  );
}

export function lifecycle() {
  return (
    <Stack gap="md">
      <Plan />
      <Plan active={false} />
    </Stack>
  );
}
