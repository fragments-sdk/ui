/**
 * State fixtures for ScrollArea, rendered by `pnpm run test:states`.
 *
 * @family:shell
 * @na:empty An empty area has nothing to scroll; the caller shows its own empty state.
 * @na:loading The area is a frame; its content owns loading.
 * @na:error The area cannot fail; its content owns errors.
 */
import { TokenChecks, type InteractionCheck } from "../../test/token-probe";
import { Stack } from "../Stack";
import { ScrollArea } from ".";

const lines = Array.from({ length: 16 }, (_, index) => `Line ${index + 1} of the build log`);

export function populated() {
  return (
    <ScrollArea aria-label="Build log" style={{ inlineSize: 280, blockSize: 120 }}>
      {lines.map((line) => (
        <p key={line} style={{ margin: 0 }}>
          {line}
        </p>
      ))}
    </ScrollArea>
  );
}

export function overflow() {
  return (
    <Stack gap="lg">
      <ScrollArea
        showFades
        aria-label="Build log, faded"
        style={{ inlineSize: 280, blockSize: 120 }}
      >
        {lines.map((line) => (
          <p key={line} style={{ margin: 0 }}>
            {line}
          </p>
        ))}
      </ScrollArea>
      <ScrollArea
        orientation="horizontal"
        showFades
        aria-label="Wide row"
        style={{ inlineSize: 280 }}
      >
        <div style={{ display: "flex", gap: 8, inlineSize: "max-content" }}>
          {lines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </div>
      </ScrollArea>
    </Stack>
  );
}

export function lifecycle() {
  return (
    <Stack gap="lg">
      <ScrollArea
        aria-label="Build log, focused"
        data-states-interact="hover"
        style={{ inlineSize: 280, blockSize: 96 }}
      >
        {lines.map((line) => (
          <p key={line} style={{ margin: 0 }}>
            {line}
          </p>
        ))}
      </ScrollArea>
      <ScrollArea
        scrollbarVisibility="always"
        aria-label="Build log, always"
        style={{ inlineSize: 280, blockSize: 96 }}
      >
        {lines.map((line) => (
          <p key={line} style={{ margin: 0 }}>
            {line}
          </p>
        ))}
      </ScrollArea>
    </Stack>
  );
}

// Keyboard focus on a scrolling viewport: the root draws the ring outside its
// edge, so the edge mask on the viewport never fades it.
const ringOnRoot: InteractionCheck = (interaction, element) => {
  if (interaction !== "focus") return [];
  const root = element.closest<HTMLElement>("[data-slot='scroll-area']");
  const ring = root ? getComputedStyle(root) : null;
  return [
    {
      label: "The root draws the focus ring outside its edge",
      actual: ring ? `${ring.outlineStyle} offset ${ring.outlineOffset}` : "missing",
      pass: Boolean(ring) && ring!.outlineStyle === "solid" && parseFloat(ring!.outlineOffset) > 0,
    },
    {
      label: "The masked viewport draws no ring of its own",
      actual: getComputedStyle(element).outlineStyle,
      pass: getComputedStyle(element).outlineStyle === "none",
    },
  ];
};

const noChecksAtRest = () => [];

export function lifecycleFocus() {
  return (
    <TokenChecks
      title="Keyboard focus on a faded area"
      check={noChecksAtRest}
      interact={ringOnRoot}
    >
      <ScrollArea
        showFades
        aria-label="Build log, keyboard"
        data-states-interact="focus"
        style={{ inlineSize: 280, blockSize: 96 }}
      >
        {lines.map((line) => (
          <p key={line} style={{ margin: 0 }}>
            {line}
          </p>
        ))}
      </ScrollArea>
    </TokenChecks>
  );
}
