/**
 * State fixtures for Alert, rendered by `pnpm run test:states`.
 *
 * @family:feedback
 * @na:empty An alert always says something; with nothing to say it is not shown.
 * @na:loading An alert reports a settled state; work in progress shows the loading recipe.
 */
import { Alert } from ".";
import { Button } from "../Button";
import { Stack } from "../Stack";
import { colorAs, find, oncePerHost, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames, type Check } from "../../test/token-probe";

async function checkPaint(host: HTMLElement): Promise<Check[]> {
  const { checks, add } = recorder();
  await frames(2);
  const alert = find<HTMLElement>(host, '[role="alert"]');
  const style = getComputedStyle(alert);
  const tint = colorAs(host, "var(--fui-color-warning-tint)");
  const ink = colorAs(host, "var(--fui-text-primary)");
  const toneInk = colorAs(host, "var(--fui-color-warning-text)");
  add("The fill is the tone tint", style.backgroundColor, style.backgroundColor === tint);
  add("No edge: the fill marks the plane", style.borderTopWidth, style.borderTopWidth === "0px");
  add("Body copy is ink 1", style.color, style.color === ink);
  const icon = find<HTMLElement>(alert, '[aria-hidden="true"]');
  const iconStyle = getComputedStyle(icon);
  add("The icon is tone ink", iconStyle.color, iconStyle.color === toneInk);
  add(
    "The icon has no disc",
    iconStyle.backgroundColor,
    iconStyle.backgroundColor === "rgba(0, 0, 0, 0)"
  );
  return checks;
}

export function populated() {
  return (
    <TokenChecks title="Tint, icon and ink" check={checkPaint}>
      <Stack gap="sm">
        <Alert tone="info">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Content>The next check runs at 15:00.</Alert.Content>
          </Alert.Body>
        </Alert>
        <Alert tone="warning">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Title>Contract out of date</Alert.Title>
            <Alert.Content>Two token files changed since the last approval.</Alert.Content>
          </Alert.Body>
          <Alert.Actions>
            <Alert.Action>Review changes</Alert.Action>
          </Alert.Actions>
        </Alert>
      </Stack>
    </TokenChecks>
  );
}

export function error() {
  return (
    <Alert tone="danger">
      <Alert.Icon />
      <Alert.Body>
        <Alert.Title>The check could not run</Alert.Title>
        <Alert.Content>The workflow token expired on 2 October.</Alert.Content>
      </Alert.Body>
      <Alert.Actions>
        <Alert.Action>Renew token</Alert.Action>
      </Alert.Actions>
    </Alert>
  );
}

export function overflow() {
  return (
    <div style={{ maxInlineSize: 320 }}>
      <Alert tone="warning">
        <Alert.Icon />
        <Alert.Body>
          <Alert.Content>
            fragments-sdk/a-repository-with-a-very-long-name-that-has-no-natural-break changed
            src/tokens/_variables.scss.
          </Alert.Content>
        </Alert.Body>
      </Alert>
    </div>
  );
}

const checkDismiss = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const close = find<HTMLButtonElement>(host, 'button[aria-label="Dismiss alert"]');
  const alert = close.closest<HTMLElement>('[role="status"], [role="alert"]');
  const next = find<HTMLButtonElement>(host, '[data-role="next"]');
  close.focus();
  close.click();
  for (let index = 0; index < 4; index += 1) await Promise.resolve();
  add(
    "The alert leaves at once",
    alert?.isConnected ? "still mounted" : "gone",
    Boolean(alert) && !alert!.isConnected
  );
  add(
    "Focus moves to the next item",
    document.activeElement?.textContent ?? "none",
    document.activeElement === next
  );
  next.blur();
  return checks;
});

export function lifecycleDismiss() {
  return (
    <TokenChecks title="Dismiss" check={checkDismiss}>
      <Stack gap="md">
        <Alert tone="info">
          <Alert.Icon />
          <Alert.Body>
            <Alert.Content>Repository connected.</Alert.Content>
          </Alert.Body>
          <Alert.Close />
        </Alert>
        <div>
          <Button data-role="next">Open repository</Button>
        </div>
      </Stack>
    </TokenChecks>
  );
}
