/**
 * State fixtures for Avatar, rendered by `pnpm run test:states`.
 *
 * @family:feedback
 * @na:empty An avatar with nothing known about the person draws the placeholder glyph; populated covers it.
 * @na:lifecycle An avatar does not change after it renders except for the image load, which loading covers.
 */
import { Avatar } from ".";
import { Stack } from "../Stack";
import { colorAs, find, oncePerHost, recorder } from "../../test/recipe-checks";
import { TokenChecks, frames } from "../../test/token-probe";

const checkPaint = oncePerHost(async (host) => {
  const { checks, add } = recorder();
  await frames(2);
  const named = getComputedStyle(find<HTMLElement>(host, '[data-role="named"]'));
  const blank = getComputedStyle(find<HTMLElement>(host, '[data-role="blank"]'));
  const tint = colorAs(host, "var(--fui-color-accent-tint)");
  const ink = colorAs(host, "var(--fui-color-accent-text)");
  const band = colorAs(host, "var(--fui-bg-secondary)");
  add(
    "Initials sit on the accent's soft fill",
    named.backgroundColor,
    named.backgroundColor === tint
  );
  add("Initials are the accent's ink", named.color, named.color === ink);
  add("The placeholder sits on the band", blank.backgroundColor, blank.backgroundColor === band);
  add("The default is the 24px track", named.blockSize, named.blockSize === "24px");
  add(
    "A rounded square, not a circle",
    named.borderTopLeftRadius,
    parseFloat(named.borderTopLeftRadius) < 12
  );
  // The next tile and its ring stop short of the initials before it.
  const items = Array.from(find(host, '[data-role="group"]').children) as HTMLElement[];
  const clipped = items.slice(0, -1).filter((item, index) => {
    const words = item.querySelector("span");
    if (!words) return false;
    const next = items[index + 1].getBoundingClientRect();
    return words.getBoundingClientRect().right > next.left - 2;
  });
  add("A group never covers the initials", `${clipped.length} covered`, clipped.length === 0);
  return checks;
});

export function populated() {
  return (
    <TokenChecks title="Paint" check={checkPaint}>
      <Stack gap="md">
        <Stack direction="row" gap="sm" align="center">
          <Avatar name="Jane Doe" data-role="named" />
          <Avatar name="Jane Doe" size="sm" />
          <Avatar name="Jane Doe" size="md" />
          <Avatar name="Jane Doe" size="lg" />
          <Avatar alt="Unknown user" data-role="blank" />
        </Stack>
        <Avatar.Group max={3} size="sm" data-role="group">
          <Avatar name="Alice Johnson" />
          <Avatar name="Bob Smith" />
          <Avatar name="Carol White" />
          <Avatar name="David Brown" />
          <Avatar name="Eve Davis" />
        </Avatar.Group>
      </Stack>
    </TokenChecks>
  );
}

/** A photo that never arrives: the band holds the square while it loads. */
export function loading() {
  return (
    <Stack direction="row" gap="sm" align="center">
      <Avatar src="data:image/gif;base64," alt="Jane Doe" size="md" />
      <Avatar src="data:image/gif;base64," alt="Jane Doe" size="lg" />
    </Stack>
  );
}

/**
 * Bytes that are no image: the photo fails to decode with no network request, so the run logs
 * no 404.
 */
const BROKEN_PHOTO = "data:image/png;base64,AAAA";

/** A photo that fails falls back to the initials. */
export function error() {
  return (
    <Stack direction="row" gap="sm" align="center">
      <Avatar src={BROKEN_PHOTO} name="Jane Doe" size="md" />
      <Avatar src={BROKEN_PHOTO} alt="Unknown user" size="md" />
    </Stack>
  );
}

export function overflow() {
  return (
    <Stack direction="row" gap="sm" align="center">
      <Avatar initials="WWW" size="xs" />
      <Avatar.Group max={2}>
        <Avatar name="Alice Johnson" />
        <Avatar name="Bob Smith" />
        {Array.from({ length: 120 }, (_, index) => (
          <Avatar key={index} name={`Person ${index}`} />
        ))}
      </Avatar.Group>
    </Stack>
  );
}
