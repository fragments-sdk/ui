/**
 * State fixtures for EmptyState, rendered by `pnpm run test:states`.
 *
 * @family:feedback
 * @na:empty EmptyState is itself the empty state of the region that holds it.
 * @na:loading A region that is still loading shows Skeleton rows, not an empty state.
 * @na:error A failure is an Alert with a retry, never an empty state.
 * @na:lifecycle An empty state never changes after it renders; the region swaps it out.
 */
import { FolderSimple } from "@phosphor-icons/react";
import { EmptyState } from ".";
import { Button } from "../Button";
import { colorAs, find, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, type Check } from "../../test/token-probe";

async function checkLayout(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const root = find<HTMLElement>(host, "h3").parentElement!;
  const rootStyle = getComputedStyle(root);
  add("Start-aligned", rootStyle.alignItems, rootStyle.alignItems === "flex-start");
  add("No frame of its own", rootStyle.borderTopWidth, rootStyle.borderTopWidth === "0px");
  const tile = find<HTMLElement>(host, '[aria-hidden="true"]');
  const tileStyle = getComputedStyle(tile);
  const band = colorAs(host, "var(--fui-bg-secondary)");
  const ink2 = colorAs(host, "var(--fui-text-secondary)");
  add(
    "The icon tile is the band plane",
    tileStyle.backgroundColor,
    tileStyle.backgroundColor === band
  );
  add(
    "The tile is 36px square",
    tileStyle.inlineSize,
    tileStyle.inlineSize === "36px" && tileStyle.blockSize === "36px"
  );
  add("The glyph is ink 2", tileStyle.color, tileStyle.color === ink2);
  const copy = getComputedStyle(find<HTMLElement>(host, "p"));
  add("Copy is ink 2", copy.color, copy.color === ink2);
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Tile, title and copy" check={checkLayout}>
      <EmptyState>
        <EmptyState.Icon>
          <FolderSimple />
        </EmptyState.Icon>
        <EmptyState.Title>No repositories yet</EmptyState.Title>
        <EmptyState.Description>
          Connect a repository to start checking it against the contract.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button>Connect repository</Button>
        </EmptyState.Actions>
      </EmptyState>
    </TokenChecks>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 280 }}>
      <EmptyState size="sm">
        <EmptyState.Title>
          No findings match every filter applied to this repository right now
        </EmptyState.Title>
        <EmptyState.Description>
          Clear a filter, widen the date range or pick another branch to see the findings that were
          raised against the contract.
        </EmptyState.Description>
        <EmptyState.Actions>
          <Button>Clear every filter</Button>
          <Button variant="soft">Pick another branch</Button>
        </EmptyState.Actions>
      </EmptyState>
    </div>
  );
}
