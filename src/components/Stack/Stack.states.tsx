/**
 * State fixtures for Stack, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:loading A layout primitive draws nothing that loads; its children own their waiting state.
 * @na:error A layout primitive takes no input and fetches nothing, so it cannot fail.
 */
import { Stack } from ".";

const ITEM = {
  padding: "4px 8px",
  background: "var(--fui-bg-secondary)",
  borderRadius: "var(--fui-radius-control)",
} as const;

// A column, a row, every gap step and both divided forms.
export function populated() {
  return (
    <Stack gap="lg" style={{ inlineSize: 360 }}>
      <Stack gap="sm">
        <div style={ITEM}>Column one</div>
        <div style={ITEM}>Column two</div>
      </Stack>
      {(["none", "xs", "sm", "md", "lg", "xl"] as const).map((gap) => (
        <Stack key={gap} direction="row" gap={gap}>
          <div style={ITEM}>{gap}</div>
          <div style={ITEM}>{gap}</div>
        </Stack>
      ))}
      <Stack gap="sm" divided>
        <div>Section one</div>
        <div>Section two</div>
      </Stack>
      <Stack as="ul" direction="row" gap="sm" divided style={{ margin: 0, padding: 0 }}>
        <li style={{ listStyle: "none" }}>Checkout</li>
        <li style={{ listStyle: "none" }}>Billing</li>
        <li style={{ listStyle: "none" }}>Settings</li>
      </Stack>
    </Stack>
  );
}

// No children: the Stack collapses to nothing and draws no divider.
export function empty() {
  return (
    <Stack gap="md" divided style={{ inlineSize: 240, outline: "1px dashed var(--fui-border)" }}>
      {null}
    </Stack>
  );
}

// More children than fit: a wrapping row reflows onto new lines on the gap.
export function overflow() {
  return (
    <Stack direction="row" gap="sm" wrap style={{ inlineSize: 240 }}>
      {Array.from({ length: 9 }, (_, index) => (
        <div key={index} style={ITEM}>
          Item {index + 1}
        </div>
      ))}
    </Stack>
  );
}

// collapseBelow: the same Stack side by side in a wide pane and folded into a
// column in a narrow one; the viewport never changes.
export function lifecycleCollapse() {
  return (
    <Stack gap="lg">
      {[480, 240].map((width) => (
        <div key={width} style={{ inlineSize: width }}>
          <Stack collapseBelow="20rem" gap="sm">
            <div style={ITEM}>First name</div>
            <div style={ITEM}>Last name</div>
          </Stack>
        </div>
      ))}
    </Stack>
  );
}
