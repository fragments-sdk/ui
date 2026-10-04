/**
 * State fixtures for Prompt, rendered by `pnpm run test:states`.
 *
 * @family:ai
 */
import * as React from "react";
import { Prompt, type PromptAttachment } from ".";
import { Stack } from "../Stack";
import {
  colorAs,
  colorOf,
  find,
  framesUntil,
  oncePerHost,
  recorder,
} from "../../test/recipe-checks";
import {
  TokenChecks,
  frames,
  readLength,
  sameColor,
  wait,
  type Check,
} from "../../test/token-probe";

const MODELS = [
  { value: "fast", label: "Fast" },
  { value: "thorough", label: "Thorough" },
];

function Composer(
  props: Partial<React.ComponentProps<typeof Prompt>> & { files?: PromptAttachment[] }
) {
  const { files, ...rest } = props;
  return (
    <div style={{ inlineSize: 420 }}>
      <Prompt onSubmit={() => {}} {...rest}>
        {files && <Prompt.Attachments items={files} onRemove={() => {}} />}
        <Prompt.Textarea />
        <Prompt.Toolbar>
          <Prompt.Attach />
          <Prompt.Picker aria-label="Model" options={MODELS} defaultValue="fast" />
          <Prompt.Actions>
            <Prompt.Submit />
          </Prompt.Actions>
        </Prompt.Toolbar>
      </Prompt>
    </div>
  );
}

/** The colour a `::placeholder` rule matching `element` declares, as written. */
function placeholderRule(element: Element): string {
  const visit = (rules: CSSRuleList): string => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && rule.selectorText.includes("::placeholder")) {
        const base = rule.selectorText.replace(/::placeholder/g, "");
        if (base && element.matches(base) && rule.style.color) return rule.style.color;
      }
      if ("cssRules" in rule) {
        const found = visit((rule as CSSGroupingRule).cssRules);
        if (found) return found;
      }
    }
    return "";
  };
  for (const sheet of Array.from(document.styleSheets)) {
    const found = visit(sheet.cssRules);
    if (found) return found;
  }
  return "";
}

function frameOf(host: HTMLElement) {
  return find(host, "textarea").closest<HTMLElement>("[class*='_prompt_']")!;
}

export function populated() {
  return (
    <TokenChecks
      title="A drafted message with a file"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        const frame = frameOf(host);
        const style = getComputedStyle(frame);
        add(
          "The composer is a field on the band",
          style.backgroundColor,
          sameColor(colorOf(style.backgroundColor), colorOf(colorAs(frame, "var(--fui-field-bg)")))
        );
        add(
          "With the field hairline",
          style.borderTopColor,
          sameColor(
            colorOf(style.borderTopColor),
            colorOf(colorAs(frame, "var(--fui-field-border)"))
          )
        );
        add(
          "And the surface corner",
          style.borderTopLeftRadius,
          Math.abs(
            parseFloat(style.borderTopLeftRadius) - readLength(frame, "var(--fui-radius-surface)")
          ) < 0.5
        );
        const send = find(host, 'button[aria-label="Send"]');
        add(
          "Send is the one accent action",
          getComputedStyle(send).backgroundColor,
          sameColor(
            colorOf(getComputedStyle(send).backgroundColor),
            colorOf(colorAs(send, "var(--fui-color-accent)"))
          )
        );
        add(
          "The picker reads its name first",
          find(host, "[aria-haspopup]").textContent ?? "",
          /Model: Fast/.test(find(host, "[aria-haspopup]").textContent ?? "")
        );
        return checks;
      }}
    >
      <Composer
        defaultValue="Which files break the contract?"
        files={[{ id: "1", name: "contract.json", size: 2048 }]}
      />
    </TokenChecks>
  );
}

export function empty() {
  return (
    <TokenChecks
      title="Nothing typed yet"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        const area = find<HTMLTextAreaElement>(host, "textarea");
        const placeholder = getComputedStyle(area, "::placeholder").color;
        if (placeholder !== getComputedStyle(area).color) {
          add(
            "The placeholder is ink 3",
            placeholder,
            sameColor(
              colorOf(placeholder),
              // Resolve the token beside the text area, not inside it: a probe in a replaced
              // element is never rendered and reads the light half of light-dark().
              colorOf(colorAs(frameOf(host), "var(--fui-text-tertiary)"))
            )
          );
        } else {
          // WebKit reports the element's own style for a pseudo-element, so read the rule.
          const authored = placeholderRule(area);
          add(
            "The placeholder rule reads ink 3",
            authored || "no rule",
            authored.includes("--fui-text-tertiary")
          );
        }
        const send = find<HTMLButtonElement>(host, 'button[aria-label="Send"]');
        add("Send waits for words", String(send.disabled), send.disabled);
        return checks;
      }}
    >
      <Composer />
    </TokenChecks>
  );
}

export function loading() {
  return (
    <TokenChecks
      title="Sending, then working"
      check={async (host) => {
        const { checks, add } = recorder();
        await wait(1100);
        const send = find(host, 'button[aria-label="Send"]');
        add(
          "Sending marks Send pending",
          String(send.hasAttribute("data-pending")),
          send.hasAttribute("data-pending")
        );
        const working = find(host, "[data-working]");
        const after = getComputedStyle(working, "::after");
        add("Working plays the work wash", after.content, after.content !== "none");
        add(
          "Working is busy",
          working.getAttribute("aria-busy") ?? "",
          working.getAttribute("aria-busy") === "true"
        );
        add(
          "Send becomes Stop",
          String(working.querySelectorAll('button[aria-label="Stop"]').length),
          working.querySelectorAll('button[aria-label="Stop"]').length === 1
        );
        add(
          "The text stays editable",
          String(find<HTMLTextAreaElement>(working, "textarea").readOnly),
          !find<HTMLTextAreaElement>(working, "textarea").readOnly &&
            !find<HTMLTextAreaElement>(working, "textarea").disabled
        );
        return checks;
      }}
    >
      <Stack gap="lg">
        <Composer pending defaultValue="Summarise the drift on main." />
        <Composer working onStop={() => {}} defaultValue="And list the owners" />
      </Stack>
    </TokenChecks>
  );
}

export function error() {
  return (
    <TokenChecks
      title="Can't send as written"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(2);
        const area = find(host, "textarea");
        add(
          "The text area reports invalid",
          area.getAttribute("aria-invalid") ?? "",
          area.getAttribute("aria-invalid") === "true"
        );
        const message = find(
          host,
          `#${CSS.escape(area.getAttribute("aria-describedby") ?? "none")}`
        );
        add(
          "The reason is linked and in words",
          message.textContent ?? "",
          /4,000 characters/.test(message.textContent ?? "")
        );
        add(
          "In the danger ink",
          getComputedStyle(message).color,
          sameColor(
            colorOf(getComputedStyle(message).color),
            colorOf(colorAs(message, "var(--fui-color-danger-text)"))
          )
        );
        return checks;
      }}
    >
      <Composer
        invalid
        errorMessage="Messages can be up to 4,000 characters."
        defaultValue="A very long message"
      />
    </TokenChecks>
  );
}

const LONG = Array.from({ length: 20 }, (_, i) => `Line ${i + 1} of a long pasted log`).join("\n");

export function overflow() {
  return (
    <TokenChecks
      title="A long draft and a long file name"
      check={async (host) => {
        const { checks, add } = recorder();
        await frames(3);
        const area = find(host, "textarea");
        add(
          "The text area stops growing and scrolls",
          `${area.scrollHeight} > ${area.clientHeight}`,
          area.scrollHeight > area.clientHeight
        );
        const name = find(host, "[class*='attachmentName']");
        add(
          "A long file name ends in an ellipsis",
          getComputedStyle(name).textOverflow,
          getComputedStyle(name).textOverflow === "ellipsis" && name.scrollWidth > name.clientWidth
        );
        return checks;
      }}
    >
      <Composer
        maxRows={4}
        defaultValue={LONG}
        files={[
          {
            id: "1",
            name: "drift-report-for-every-repository-in-the-organisation-2026-10-03.csv",
            size: 81920,
          },
        ]}
      />
    </TokenChecks>
  );
}

function Sends() {
  const [sent, setSent] = React.useState("");
  return (
    <div>
      <Composer onSubmit={setSent} />
      <output data-sent>{sent}</output>
    </div>
  );
}

// Typing and sending are side effects: run once per host, so a remount does not send twice.
const checkSend = oncePerHost(async (host: HTMLElement): Promise<Check[]> => {
  const { checks, add } = recorder();
  await frames(2);
  const area = find<HTMLTextAreaElement>(host, "textarea");
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")!.set!;
  setter.call(area, "Check main");
  area.dispatchEvent(new Event("input", { bubbles: true }));
  await frames(2);
  const send = find<HTMLButtonElement>(host, 'button[aria-label="Send"]');
  add("Words enable Send", String(send.disabled), !send.disabled);
  area.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true }));
  await frames(1);
  add(
    "Shift+Enter does not send",
    find(host, "[data-sent]").textContent ?? "",
    find(host, "[data-sent]").textContent === ""
  );
  area.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
  );
  await framesUntil(() => find(host, "[data-sent]").textContent !== "", 30);
  add(
    "Enter sends",
    find(host, "[data-sent]").textContent ?? "",
    find(host, "[data-sent]").textContent === "Check main"
  );
  return checks;
});

export function lifecycle() {
  return (
    <TokenChecks title="Type, then send" check={checkSend}>
      <Sends />
    </TokenChecks>
  );
}
