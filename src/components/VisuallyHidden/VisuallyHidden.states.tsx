/**
 * State fixtures for VisuallyHidden, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:empty Hidden text with nothing in it is not rendered by its caller.
 * @na:loading Hidden text draws nothing that loads.
 * @na:error Hidden text takes no input and fetches nothing, so it cannot fail.
 * @na:overflow The hidden box is clipped to nothing by design; the revealed chip is one line.
 */
import { VisuallyHidden } from ".";

// Hidden label beside visible text: only the visible words take space.
export function populated() {
  return (
    <p>
      Read more
      <VisuallyHidden> about the governance loop</VisuallyHidden>
    </p>
  );
}

// The skip link holding keyboard focus: a raised chip at the top corner.
export function lifecycleRevealed() {
  return (
    <div style={{ blockSize: 120 }}>
      <VisuallyHidden focusable>
        <a href="#main-content" data-states-interact="focus">
          Skip to main content
        </a>
      </VisuallyHidden>
      {/* The chip floats over the page by design; the copy starts below it. */}
      <p style={{ paddingBlockStart: 56 }}>Page content</p>
    </div>
  );
}
