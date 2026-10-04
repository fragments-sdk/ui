/**
 * State fixtures for Icon, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:empty An icon is a glyph; it holds no data, so it is never empty.
 * @na:loading The glyph is inline SVG from the caller; nothing loads.
 * @na:error An icon takes no input and fetches nothing, so it cannot fail.
 * @na:overflow A glyph is a fixed square on the ladder; it never overflows.
 */
import { Check, Heart, Info, Star, Warning } from "@phosphor-icons/react";
import { Icon } from ".";

const ROW = { display: "flex", alignItems: "center", gap: 12 } as const;

// The ladder (12, 14, 16, 18, 24), the three weights and the one ink axis.
export function populated() {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={ROW}>
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <Icon key={size} icon={Star} size={size} />
        ))}
      </div>
      <div style={ROW}>
        {(["regular", "bold", "fill"] as const).map((weight) => (
          <Icon key={weight} icon={Heart} weight={weight} />
        ))}
      </div>
      <div style={ROW}>
        <Icon icon={Heart} />
        <Icon icon={Heart} tone="secondary" />
        <Icon icon={Heart} tone="tertiary" />
        <Icon icon={Info} tone="accent" />
        <Icon icon={Info} tone="info" />
        <Icon icon={Check} tone="success" />
        <Icon icon={Warning} tone="warning" />
        <Icon icon={Warning} tone="danger" aria-label="Failed" />
      </div>
    </div>
  );
}

// An icon inherits its host's ink and its disabled dim; it never dims itself.
export function lifecycle() {
  return (
    <div style={ROW}>
      <span style={{ color: "var(--fui-text-secondary)" }}>
        <Icon icon={Info} /> Inherits the ink beside it
      </span>
      <span aria-disabled="true" style={{ opacity: "var(--fui-opacity-disabled)" }}>
        <Icon icon={Info} /> Inside a disabled host
      </span>
    </div>
  );
}
