/**
 * State fixtures for Image, rendered by `pnpm run test:states`.
 *
 * @family:primitives
 * @na:empty An image always has a source; a missing one is the error state.
 */
import { Image } from ".";
import styles from "./Image.module.scss";

// A local SVG keeps the fixture off the network.
const PICTURE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="#7a8899"/><circle cx="240" cy="70" r="32" fill="#c9d2dc"/><path d="M0 240 120 110l90 90 40-40 70 80Z" fill="#4b5866"/></svg>'
)}`;
const ROW = { display: "flex", gap: 12, alignItems: "start" } as const;

export function populated() {
  return (
    <div style={ROW}>
      <Image src={PICTURE} alt="Hills" aspectRatio="1:1" width={120} />
      <Image src={PICTURE} alt="Hills" aspectRatio="4:3" width={160} radius="control" />
      <Image src={PICTURE} alt="Hills" aspectRatio="16:9" width={200} radius="surface" />
      <Image src={PICTURE} alt="Hills" aspectRatio="1:1" width={120} objectFit="contain" />
    </div>
  );
}

// The frame while its file is in flight: the band pulsing toward the press
// tint. Drawn from the module class so the fixture never waits on a network.
export function loading() {
  return (
    <div style={ROW}>
      <div
        className={[styles.frame, styles["aspect-4-3"], styles["radius-control"]].join(" ")}
        data-state="loading"
        aria-busy="true"
        style={{ inlineSize: 160 }}
      />
    </div>
  );
}

export function error() {
  return (
    <div style={ROW}>
      <Image
        src="data:image/png;base64,broken"
        alt="Team photo from the offsite"
        aspectRatio="4:3"
        width={200}
        radius="control"
      />
    </div>
  );
}

export function overflow() {
  return (
    <div style={{ inlineSize: 120 }}>
      <Image
        src="data:image/png;base64,broken"
        alt="A very long description of a picture that will not fit in a small frame"
        aspectRatio="1:1"
        width={120}
      />
    </div>
  );
}

// The loaded image fades in over the micro duration; reduced motion shows it at once.
export function lifecycleReducedMotion() {
  return <Image src={PICTURE} alt="Hills" aspectRatio="4:3" width={160} />;
}
