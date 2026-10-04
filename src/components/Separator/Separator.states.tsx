/**
 * State fixtures for Separator, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:empty A rule holds no data; without a label it is still one hairline.
 * @na:loading A rule draws nothing that loads.
 * @na:error A rule takes no input and fetches nothing, so it cannot fail.
 */
import { Separator } from ".";

const COLUMN = { display: "flex", flexDirection: "column", gap: 12, inlineSize: 320 } as const;
const ROW = { display: "flex", alignItems: "center", gap: 4, blockSize: 40 } as const;
const CHIP = { padding: "4px 8px" } as const;

// Every form: the horizontal rule, the labelled break, the full vertical
// rule and the control-length toolbar divider.
export function populated() {
  return (
    <div style={COLUMN}>
      <span>Above</span>
      <Separator />
      <span>Below</span>
      <Separator label="Or" />
      <div style={ROW}>
        <span style={CHIP}>Item 1</span>
        <Separator orientation="vertical" />
        <span style={CHIP}>Item 2</span>
      </div>
      <div style={ROW}>
        <span style={CHIP}>Bold</span>
        <span style={CHIP}>Italic</span>
        <Separator orientation="vertical" length="control" />
        <span style={CHIP}>Link</span>
      </div>
    </div>
  );
}

// A long label in a narrow column: the rules keep a short stub on each side
// and the words wrap, centred, instead of spilling out of the column.
export function overflow() {
  return (
    <div style={{ ...COLUMN, inlineSize: 200 }}>
      <Separator label="Continue with a single sign-on provider" />
    </div>
  );
}

// The labelled break inside a row container: the rule takes the free space.
export function lifecycleInRow() {
  return (
    <div style={{ display: "flex", inlineSize: 320 }}>
      <Separator label="Today" />
    </div>
  );
}
