/**
 * State fixtures for Accordion, rendered by `pnpm run test:states`.
 *
 * @family:navigation
 * @na:empty An accordion always has its items; with none there is nothing to render.
 * @na:loading The fold is static; each panel owns loading.
 * @na:error The fold cannot fail; each panel owns errors.
 */
import { Accordion } from ".";

export function populated() {
  return (
    <div style={{ maxInlineSize: 420 }}>
      <Accordion defaultValue={["why"]}>
        <Accordion.Item value="why">
          <Accordion.Trigger>Why did this check block?</Accordion.Trigger>
          <Accordion.Content>
            Two buttons use a colour outside the token set. Each one is listed with its file and
            line.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="fix">
          <Accordion.Trigger>How do I fix it?</Accordion.Trigger>
          <Accordion.Content>
            Swap the literal for the matching token and push again.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="skip">
          <Accordion.Trigger>Can I skip it once?</Accordion.Trigger>
          <Accordion.Content>An admin can record an exception with a reason.</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 240 }}>
      <Accordion multiple defaultValue={["long"]}>
        <Accordion.Item value="long">
          <Accordion.Trigger>
            A question long enough to wrap onto a second line in a narrow column
          </Accordion.Trigger>
          <Accordion.Content>
            The answer wraps under the row and keeps the row inset on both sides.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="short">
          <Accordion.Trigger>Short</Accordion.Trigger>
          <Accordion.Content>Short answer.</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export function lifecycle() {
  return (
    <div style={{ maxInlineSize: 420 }}>
      <Accordion defaultValue={["open"]}>
        <Accordion.Item value="closed">
          <Accordion.Trigger data-states-interact="hover focus">Closed</Accordion.Trigger>
          <Accordion.Content>Closed content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="open">
          <Accordion.Trigger>Open</Accordion.Trigger>
          <Accordion.Content>Open content</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="disabled" disabled>
          <Accordion.Trigger>Disabled</Accordion.Trigger>
          <Accordion.Content>Disabled content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}
