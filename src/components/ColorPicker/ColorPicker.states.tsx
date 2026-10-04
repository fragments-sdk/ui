/**
 * State fixtures for ColorPicker, rendered by `pnpm run test:states`.
 *
 * @family:pickers
 * @na:empty A colour picker always holds a colour.
 * @na:overflow A hex value has a fixed length; the field never overflows.
 */
import { ColorPicker } from ".";
import styles from "./ColorPicker.module.scss";
import { Skeleton } from "../Skeleton";
import {
  anchorGap,
  escapeCloses,
  find,
  framesUntil,
  near,
  oncePerHost,
  popupSettled,
  recorder,
  showing,
  stillPopupChecks,
} from "../../test/recipe-checks";
import { TokenChecks } from "../../test/token-probe";

function popup() {
  return document.querySelector<HTMLElement>('[aria-label="Brand colour color picker"]');
}

export function populated() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ColorPicker label="Brand colour" defaultValue="#3b82f6" />
      <ColorPicker label="Small" defaultValue="#3b82f6" size="sm" />
      <ColorPicker
        label="Read only"
        defaultValue="#3b82f6"
        readOnly
        helperText="Set by your organisation"
      />
    </div>
  );
}

// The canvas placeholder while react-colorful resolves, drawn from the module
// class so the fixture never waits on the import.
export function loading() {
  return (
    <div className={styles.canvasFallback} aria-hidden="true">
      <Skeleton fill />
    </div>
  );
}

export function error() {
  return (
    <ColorPicker
      label="Brand colour"
      defaultValue="#000000"
      invalid
      errorMessage="Pick a colour with 3:1 contrast on the page"
    />
  );
}

const checkOpen = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  const swatch = find<HTMLButtonElement>(host, 'button[aria-label="Edit Brand colour color"]');
  swatch.click();
  const opened = await framesUntil(() => Boolean(popup()));
  add("The picker opens", opened < 0 ? "never" : `after ${opened} frame(s)`, opened >= 0);
  const surface = popup();
  if (!surface) return checks;
  await popupSettled(surface);
  checks.push(...stillPopupChecks("The picker", surface));
  const { side, gap } = anchorGap(surface, swatch);
  add("The picker sits 4 from its swatch", `${gap.toFixed(2)}px (${side})`, near(gap, 4, 0.5));
  surface.focus();
  checks.push(...(await escapeCloses("picker", () => showing(popup()), swatch)));
  swatch.blur();
  return checks;
});

export function lifecycleOpen() {
  return (
    <TokenChecks title="Open and close" check={checkOpen}>
      <ColorPicker label="Brand colour" defaultValue="#3b82f6" />
    </TokenChecks>
  );
}

export function lifecycleDisabled() {
  return <ColorPicker label="Locked colour" defaultValue="#64748b" disabled />;
}
