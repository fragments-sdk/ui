/**
 * State fixtures for Grid, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:loading A layout primitive draws nothing that loads; its children own their waiting state.
 * @na:error A layout primitive takes no input and fetches nothing, so it cannot fail.
 */
import { Grid } from ".";

const CELL = {
  padding: 8,
  background: "var(--fui-bg-secondary)",
  borderRadius: "var(--fui-radius-control)",
} as const;

// Fixed counts, spans and the auto-fill row.
export function populated() {
  return (
    <div style={{ display: "grid", gap: 16, inlineSize: 480 }}>
      {([1, 2, 3, 4, 6, 12] as const).map((columns) => (
        <Grid key={columns} columns={columns} gap="xs">
          {Array.from({ length: columns }, (_, index) => (
            <div key={index} style={CELL}>
              {index + 1}
            </div>
          ))}
        </Grid>
      ))}
      <Grid columns={4} gap="sm">
        <Grid.Item colSpan={2} style={CELL}>
          Spans two
        </Grid.Item>
        <div style={CELL}>One</div>
        <div style={CELL}>One</div>
        <Grid.Item colSpan="full" style={CELL}>
          Full row
        </Grid.Item>
      </Grid>
      <Grid columns="auto" minChildWidth="6rem" gap="sm">
        {["A", "B", "C", "D", "E"].map((label) => (
          <div key={label} style={CELL}>
            {label}
          </div>
        ))}
      </Grid>
    </div>
  );
}

// No children: the grid holds no tracks and takes no height.
export function empty() {
  return (
    <div style={{ inlineSize: 320, outline: "1px dashed var(--fui-border)" }}>
      <Grid columns={3} />
    </div>
  );
}

// An unbroken word in a narrow track: minmax(0, 1fr) keeps the track at its
// share and the word clips inside its own cell instead of widening the row.
export function overflow() {
  return (
    <Grid columns={3} gap="sm" style={{ inlineSize: 300 }}>
      <div style={{ ...CELL, overflow: "hidden", textOverflow: "ellipsis" }}>
        governance-findings-repository-identifier
      </div>
      <div style={CELL}>Two</div>
      <div style={CELL}>Three</div>
    </Grid>
  );
}

// The capped count at three pane widths: three tracks, then two, then one.
export function lifecycleCapped() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {[480, 300, 160].map((width) => (
        <div key={width} style={{ inlineSize: width }}>
          <Grid columns={3} minChildWidth="8rem" gap="sm">
            <div style={CELL}>One</div>
            <div style={CELL}>Two</div>
            <div style={CELL}>Three</div>
          </Grid>
        </div>
      ))}
    </div>
  );
}
