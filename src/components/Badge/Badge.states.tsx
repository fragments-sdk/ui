/**
 * State fixtures for Badge, rendered by `pnpm run test:states`.
 *
 * @family:feedback
 * @na:empty A badge always carries words; with nothing to say it is not shown.
 * @na:loading A badge reports a settled fact; work in progress shows the loading recipe.
 * @na:error A badge has no failure of its own; the danger tone is a populated state.
 */
import * as React from "react";
import { Badge } from ".";
import { Stack } from "../Stack";
import { colorAs, find, oncePerHost, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames } from "../../test/token-probe";

const checkPaint = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const neutral = find<HTMLElement>(host, '[data-role="neutral"]');
  const danger = find<HTMLElement>(host, '[data-role="danger"]');
  const band = colorAs(host, "var(--fui-bg-secondary)");
  const ink2 = colorAs(host, "var(--fui-text-secondary)");
  const dangerTint = colorAs(host, "var(--fui-color-danger-tint)");
  const dangerInk = colorAs(host, "var(--fui-color-danger-text)");
  const neutralStyle = getComputedStyle(neutral);
  const dangerStyle = getComputedStyle(danger);
  add("Neutral is the band", neutralStyle.backgroundColor, neutralStyle.backgroundColor === band);
  add("Neutral reads secondary ink", neutralStyle.color, neutralStyle.color === ink2);
  add(
    "A tone paints its soft fill",
    dangerStyle.backgroundColor,
    dangerStyle.backgroundColor === dangerTint
  );
  add("A tone writes its ink", dangerStyle.color, dangerStyle.color === dangerInk);
  add("One 20px step", neutralStyle.blockSize, neutralStyle.blockSize === "20px");
  return checks;
});

export function populated() {
  return (
    <TokenChecks title="Paint" check={checkPaint}>
      <Stack direction="row" gap="sm" wrap>
        <Badge data-role="neutral">Draft</Badge>
        <Badge tone="accent">New</Badge>
        <Badge tone="info">Queued</Badge>
        <Badge tone="success" dot>
          Passing
        </Badge>
        <Badge tone="warning">Stale</Badge>
        <Badge tone="danger" data-role="danger">
          Blocked
        </Badge>
        <Badge onRemove={() => {}}>react</Badge>
      </Stack>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 160 }}>
      <Stack gap="sm">
        <Badge>fragments-sdk/a-repository-with-a-very-long-name</Badge>
        <Badge tone="info" onRemove={() => {}}>
          an-extremely-long-user-tag-name
        </Badge>
      </Stack>
    </div>
  );
}

const checkRemove = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const remove = find<HTMLButtonElement>(host, 'button[aria-label="Remove react"]');
  const hit = getComputedStyle(remove, "::after");
  add("The remove button draws a hit area", hit.inlineSize, parseFloat(hit.inlineSize) >= 24);
  remove.click();
  for (let index = 0; index < 4; index += 1) await Promise.resolve();
  add(
    "Pressing remove takes the badge away",
    host.querySelector('button[aria-label="Remove react"]') ? "still there" : "gone",
    !host.querySelector('button[aria-label="Remove react"]')
  );
  return checks;
});

function RemovableTags() {
  const [tags, setTags] = React.useState(["react", "typescript"]);
  return (
    <Stack direction="row" gap="sm" wrap>
      {tags.map((tag) => (
        <Badge key={tag} onRemove={() => setTags((all) => all.filter((item) => item !== tag))}>
          {tag}
        </Badge>
      ))}
    </Stack>
  );
}

export function lifecycleRemove() {
  return (
    <TokenChecks title="Remove" check={checkRemove}>
      <RemovableTags />
    </TokenChecks>
  );
}
