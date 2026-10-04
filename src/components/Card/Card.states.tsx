/**
 * State fixtures for Card, rendered by `pnpm run test:states`.
 *
 * @family:feedback
 * @na:empty A card with nothing in it is not shown; no data is an EmptyState inside the card.
 * @na:loading A card never waits itself; Skeleton rows in the loaded shape sit inside it.
 */
import * as React from "react";
import { Card } from ".";
import { Badge } from "../Badge";
import { Stack } from "../Stack";
import { Text } from "../Text";
import { colorAs, find, oncePerHost, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, settle } from "../../test/token-probe";

const checkSurface = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const card = getComputedStyle(find<HTMLElement>(host, '[data-role="card"]'));
  add(
    "The card is the surface plane",
    card.backgroundColor,
    card.backgroundColor === colorAs(host, "var(--fui-bg-primary)")
  );
  add(
    "The edge is the one hairline",
    card.borderTopColor,
    card.borderTopColor === colorAs(host, "var(--fui-border)") && card.borderTopWidth === "1px"
  );
  add("No shadow", card.boxShadow, card.boxShadow === "none");
  add("The compact inset", card.paddingTop, card.paddingTop === "12px");
  const head = getComputedStyle(find<HTMLElement>(host, '[data-role="head"]'));
  add(
    "The divided head has no fill",
    head.backgroundColor,
    head.backgroundColor === "rgba(0, 0, 0, 0)"
  );
  add("The divided head is 40px", head.minBlockSize, head.minBlockSize === "40px");
  return checks;
});

export function populated() {
  return (
    <TokenChecks title="Surface" check={checkSurface}>
      <Stack gap="md" style={{ maxInlineSize: 420 }}>
        <Card data-role="card">
          <Card.Header>
            <Card.Title>web</Card.Title>
            <Card.Description>fragments-sdk/web · checked 2 minutes ago</Card.Description>
          </Card.Header>
          <Card.Body>
            <Stack direction="row" gap="sm">
              <Badge tone="success">Passing</Badge>
              <Text color="secondary">12 canonical components</Text>
            </Stack>
          </Card.Body>
        </Card>
        <Card padding="none">
          <Card.Header divided data-role="head">
            <Card.Title>Findings</Card.Title>
            <Text type="caption" color="tertiary" tabularNums>
              24
            </Text>
          </Card.Header>
          <Card.Body padding="md">Two blocking, 22 advisory.</Card.Body>
        </Card>
        <Card render={<a href="#repo" />}>
          <Card.Title>docs</Card.Title>
          <Card.Description>The whole card is one link.</Card.Description>
        </Card>
      </Stack>
    </TokenChecks>
  );
}

const checkDanger = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const card = getComputedStyle(find<HTMLElement>(host, '[data-role="held"]'));
  add(
    "A held card draws the danger ink edge",
    card.borderTopColor,
    card.borderTopColor === colorAs(host, "var(--fui-color-danger-text)")
  );
  add(
    "No wash: the surface stays",
    card.backgroundColor,
    card.backgroundColor === colorAs(host, "var(--fui-bg-primary)")
  );
  return checks;
});

export function error() {
  return (
    <TokenChecks title="Held" check={checkDanger}>
      <Card tone="danger" data-role="held" style={{ maxInlineSize: 420 }}>
        <Card.Header>
          <Card.Title>Merge held</Card.Title>
          <Card.Description>Two blocking findings need a decision.</Card.Description>
        </Card.Header>
      </Card>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <Card style={{ maxInlineSize: 280 }}>
      <Card.Header>
        <Card.Title>
          A detailed localized account recovery policy for administrators across workspaces
        </Card.Title>
        <Card.Description>
          fragments-sdk/a-repository-with-a-very-long-name-that-has-no-natural-break
        </Card.Description>
      </Card.Header>
      <Card.Body>
        Recovery settings apply to every affected administrator and keep an auditable history.
      </Card.Body>
    </Card>
  );
}

const checkSelect = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const target = find<HTMLButtonElement>(host, '[data-role="team"]');
  target.click();
  await frames(2);
  // Read the selected state at rest, not mid-transition.
  settle(target);
  const style = getComputedStyle(target);
  add(
    "The chosen card takes the selection wash",
    style.backgroundColor,
    style.backgroundColor === colorAs(host, "var(--fui-control-selected-bg)")
  );
  add(
    "The hairline turns into the ring",
    style.borderTopColor,
    style.borderTopColor === colorAs(host, "var(--fui-control-selected-border)")
  );
  add(
    "aria-pressed follows",
    String(target.getAttribute("aria-pressed")),
    target.getAttribute("aria-pressed") === "true"
  );
  const block = target.querySelector("div, p, h1, h2, h3, h4, h5, h6");
  add("The button holds phrasing content only", block?.tagName ?? "none", block === null);
  target.blur();
  return checks;
});

function Plans() {
  const [chosen, setChosen] = React.useState("Repository");
  return (
    <Stack direction="row" gap="md">
      {["Repository", "Team"].map((plan) => (
        <Card
          key={plan}
          data-role={plan.toLowerCase()}
          selected={plan === chosen}
          render={<button type="button" aria-pressed={plan === chosen} />}
          onClick={() => setChosen(plan)}
        >
          <Card.Title>{plan}</Card.Title>
        </Card>
      ))}
    </Stack>
  );
}

export function lifecycleSelect() {
  return (
    <TokenChecks title="Select" check={checkSelect}>
      <Plans />
    </TokenChecks>
  );
}
