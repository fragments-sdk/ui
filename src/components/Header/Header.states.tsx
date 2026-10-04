/**
 * State fixtures for Header, rendered by `pnpm run test:states`.
 *
 * @family:shell
 * @na:empty A header always carries at least the brand or the trigger; an empty bar is not shown.
 * @na:loading The bar renders with the page; nothing in it loads.
 * @na:error The bar has no failure state; errors belong to the page below it.
 */
import { Header } from ".";
import { Button } from "../Button";
import { TokenChecks, type InteractionCheck } from "../../test/token-probe";

// The nav shows from the md container width up, so the wide states give the bar
// room for it; the harness frame otherwise shrinks to the brand.
const WIDE = { inlineSize: 880 };

export function populated() {
  return (
    <div style={WIDE}>
      <Header>
        <Header.SkipLink />
        <Header.Brand href="#home">Fragments</Header.Brand>
        <Header.Nav>
          <Header.NavItem href="#overview" active>
            Overview
          </Header.NavItem>
          <Header.NavItem href="#findings">Findings</Header.NavItem>
          <Header.NavMenu label="Governance">
            <Header.NavMenuItem href="#contract">Contract</Header.NavMenuItem>
            <Header.NavMenuItem href="#exceptions">Exceptions</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
        <Header.Actions>
          <Button variant="soft">Sign in</Button>
        </Header.Actions>
      </Header>
    </div>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 360 }}>
      <Header>
        <Header.Trigger aria-expanded={false} />
        <Header.Brand href="#home">Fragments Cloud governance</Header.Brand>
        <Header.Nav>
          <Header.NavItem href="#overview">Overview</Header.NavItem>
        </Header.Nav>
        <Header.Actions>
          <Button variant="soft">Sign in</Button>
        </Header.Actions>
      </Header>
    </div>
  );
}

export function lifecycle() {
  return (
    <div style={WIDE}>
      <Header>
        <Header.Brand href="#home">Fragments</Header.Brand>
        <Header.Nav>
          <Header.NavItem href="#rest">Rest</Header.NavItem>
          <Header.NavItem href="#hover" data-states-interact="hover">
            Hover
          </Header.NavItem>
          <Header.NavItem href="#press" data-states-interact="press">
            Press
          </Header.NavItem>
          <Header.NavItem href="#current" active data-states-interact="hover">
            Current
          </Header.NavItem>
          <Header.NavItem href="#focus" data-states-interact="focus">
            Focus
          </Header.NavItem>
          <Header.NavItem disabled>Disabled</Header.NavItem>
          <Header.NavMenu label="Group" active data-states-interact="hover">
            <Header.NavMenuItem href="#a">Item</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
      </Header>
    </div>
  );
}

/** Focused, the skip link is a visible chip: nothing clips it to the hidden box. */
const skipRevealed: InteractionCheck = (interaction, element) => {
  if (interaction !== "focus") return [];
  const chip = element.parentElement ?? element;
  const style = getComputedStyle(chip);
  const box = chip.getBoundingClientRect();
  return [
    { label: "No clip-path hides it", actual: style.clipPath, pass: style.clipPath === "none" },
    {
      label: "It paints a real box",
      actual: `${Math.round(box.width)}x${Math.round(box.height)}`,
      pass: box.width > 24 && box.height > 24,
    },
  ];
};

const noChecksAtRest = () => [];

export function lifecycleSkipLink() {
  return (
    <TokenChecks title="Skip link" check={noChecksAtRest} interact={skipRevealed}>
      <div style={{ ...WIDE, paddingBlockStart: 56 }}>
        <Header>
          <Header.SkipLink data-states-interact="focus" />
          <Header.Brand href="#home">Fragments</Header.Brand>
        </Header>
      </div>
    </TokenChecks>
  );
}
