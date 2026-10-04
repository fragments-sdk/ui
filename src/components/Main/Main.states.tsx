/**
 * State fixtures for Main, rendered by `pnpm run test:states`.
 *
 * @family:shell
 * @na:loading Main is the page frame; loading shows in the content it holds.
 * @na:error Main is the page frame; errors show in the content it holds.
 * @na:lifecycle Main has no interactive states.
 */
import { Main } from ".";
import { Button } from "../Button";

export function populated() {
  return (
    <Main as="div">
      <Main.Header>
        <Main.Title>Findings</Main.Title>
        <Main.Description>
          <p>Every governance finding raised against this repository, newest first.</p>
        </Main.Description>
      </Main.Header>
      <Main.Content>
        <p>Twelve findings across three repositories.</p>
      </Main.Content>
      <Main.Footer>
        <Button variant="soft">Export</Button>
      </Main.Footer>
    </Main>
  );
}

export function populatedNarrow() {
  return (
    <Main as="div" measure="narrow">
      <Main.Header>
        <Main.Title>Settings</Main.Title>
        <Main.Description>
          <p>Manage the workspace contract, canonical components and token files.</p>
        </Main.Description>
      </Main.Header>
    </Main>
  );
}

export function empty() {
  return (
    <Main as="div">
      <Main.Header>
        <Main.Title>Findings</Main.Title>
      </Main.Header>
    </Main>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 360 }}>
      <Main as="div">
        <Main.Header>
          <Main.Title>Governance findings for the design system repository</Main.Title>
          <Main.Description>
            <p>
              Every finding raised against this repository by the last check, newest first, with the
              rule that raised it and the file it points to.
            </p>
          </Main.Description>
        </Main.Header>
      </Main>
    </div>
  );
}
