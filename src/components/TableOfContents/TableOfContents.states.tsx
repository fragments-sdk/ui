/**
 * State fixtures for TableOfContents, rendered by `pnpm run test:states`.
 *
 * @family:navigation
 * @na:loading Headings are known when the page renders; nothing loads.
 * @na:error Headings are known when the page renders; nothing can fail.
 */
import { TableOfContents } from ".";

export function populated() {
  return (
    <TableOfContents>
      <TableOfContents.Item targetId="overview">Overview</TableOfContents.Item>
      <TableOfContents.Item targetId="install" active>
        Install
      </TableOfContents.Item>
      <TableOfContents.Group label="Usage">
        <TableOfContents.Item targetId="basics">Basics</TableOfContents.Item>
        <TableOfContents.Item targetId="advanced">Advanced</TableOfContents.Item>
      </TableOfContents.Group>
      <TableOfContents.Group label="Reference" collapsible={false}>
        <TableOfContents.Item targetId="props">Props</TableOfContents.Item>
      </TableOfContents.Group>
    </TableOfContents>
  );
}

// No items: the index renders nothing.
export function empty() {
  return <TableOfContents>{null}</TableOfContents>;
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 200 }}>
      <TableOfContents>
        <TableOfContents.Item targetId="long" active>
          Configuring the build for a repository with several packages
        </TableOfContents.Item>
        <TableOfContents.Item targetId="short">Usage</TableOfContents.Item>
      </TableOfContents>
    </div>
  );
}

export function lifecycle() {
  return (
    <TableOfContents>
      <TableOfContents.Item targetId="rest">Rest</TableOfContents.Item>
      <TableOfContents.Item targetId="hover" data-states-interact="hover">
        Hover
      </TableOfContents.Item>
      <TableOfContents.Item targetId="current" active data-states-interact="hover">
        Current
      </TableOfContents.Item>
      <TableOfContents.Item targetId="focus" data-states-interact="focus">
        Focus
      </TableOfContents.Item>
      <TableOfContents.Group label="Closed group" defaultOpen={false}>
        <TableOfContents.Item targetId="hidden">Hidden</TableOfContents.Item>
      </TableOfContents.Group>
    </TableOfContents>
  );
}
