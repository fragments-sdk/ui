/**
 * State fixtures for Listbox, rendered by `pnpm run test:states`.
 *
 * @family:pickers
 * @na:loading A listbox renders the options it is given; the surface that fetches them shows loading.
 * @na:error A listbox renders the options it is given; the surface that fetches them shows the error.
 */
import { Listbox } from ".";

export function populated() {
  return (
    <Listbox aria-label="Fruit" defaultValue="pear">
      <Listbox.Group label="Orchard">
        <Listbox.Item value="apple">Apple</Listbox.Item>
        <Listbox.Item value="pear">Pear</Listbox.Item>
      </Listbox.Group>
      <Listbox.Group label="Stone fruit">
        <Listbox.Item value="plum">Plum</Listbox.Item>
        <Listbox.Item value="cherry" disabled>
          Cherry
        </Listbox.Item>
      </Listbox.Group>
    </Listbox>
  );
}

export function populatedMultiple() {
  return (
    <Listbox aria-label="Labels" multiple defaultValue={["bug", "ui"]}>
      <Listbox.Item value="bug">Bug</Listbox.Item>
      <Listbox.Item value="ui">UI</Listbox.Item>
      <Listbox.Item value="docs">Docs</Listbox.Item>
    </Listbox>
  );
}

export function empty() {
  return (
    <Listbox aria-label="Fruit">
      <Listbox.Empty>No fruit matches.</Listbox.Empty>
    </Listbox>
  );
}

export function overflow() {
  return (
    <Listbox aria-label="Repositories" defaultValue="web" style={{ maxInlineSize: 240 }}>
      <Listbox.Item value="long">
        fragments-sdk/a-repository-with-a-very-long-name-that-wraps
      </Listbox.Item>
      <Listbox.Item value="web">fragments-sdk/web</Listbox.Item>
    </Listbox>
  );
}

// The selected row keeps its wash, ring and check while highlighted; the
// highlight paints over it, and only one row is ever highlighted.
export function lifecycle() {
  return (
    <Listbox aria-label="Fruit" defaultValue="pear">
      <Listbox.Item value="apple">Apple</Listbox.Item>
      <Listbox.Item value="pear" data-states-interact="hover">
        Pear
      </Listbox.Item>
      <Listbox.Item value="plum">Plum</Listbox.Item>
    </Listbox>
  );
}

export function lifecycleDisabled() {
  return (
    <Listbox aria-label="Fruit" defaultValue="pear" disabled>
      <Listbox.Item value="apple">Apple</Listbox.Item>
      <Listbox.Item value="pear">Pear</Listbox.Item>
    </Listbox>
  );
}
