/**
 * The announcer: one polite and one assertive live region per document, mounted
 * empty before anything is said (a region that appears with its message in it is
 * often not read), and shared by every caller. A message posted again before it
 * lands is announced once.
 */

export type Politeness = "polite" | "assertive";

const POLITENESS: readonly Politeness[] = ["polite", "assertive"];

const VISUALLY_HIDDEN: Partial<CSSStyleDeclaration> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: "0",
};

interface Pending {
  message: string;
  frame: number;
}

interface Registry {
  users: number;
  regions: Record<Politeness, HTMLElement>;
  pending: Record<Politeness, Pending | null>;
  removal: ReturnType<typeof setTimeout> | null;
}

const registries = new WeakMap<Document, Registry>();

function createRegion(doc: Document, politeness: Politeness) {
  const region = doc.createElement("div");
  region.setAttribute("data-fui-announcer", politeness);
  region.setAttribute("role", politeness === "assertive" ? "alert" : "status");
  region.setAttribute("aria-live", politeness);
  region.setAttribute("aria-atomic", "true");
  Object.assign(region.style, VISUALLY_HIDDEN);
  doc.body.appendChild(region);
  return region;
}

function registryFor(doc: Document): Registry {
  let registry = registries.get(doc);
  if (!registry) {
    registry = {
      users: 0,
      regions: {
        polite: createRegion(doc, "polite"),
        assertive: createRegion(doc, "assertive"),
      },
      pending: { polite: null, assertive: null },
      removal: null,
    };
    registries.set(doc, registry);
  }
  if (registry.removal !== null) {
    clearTimeout(registry.removal);
    registry.removal = null;
  }
  return registry;
}

function teardown(doc: Document, registry: Registry) {
  const view = doc.defaultView;
  for (const politeness of POLITENESS) {
    const pending = registry.pending[politeness];
    if (pending) view?.cancelAnimationFrame(pending.frame);
    registry.regions[politeness].remove();
  }
  registries.delete(doc);
}

/**
 * Mount the two regions, empty, for as long as the returned release has not run.
 * The last release removes them on the next task, so a remount in between (a
 * development double render) keeps the same regions.
 */
export function mountAnnouncer(doc: Document = document): () => void {
  const registry = registryFor(doc);
  registry.users += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    registry.users -= 1;
    if (registry.users > 0) return;
    registry.removal = setTimeout(() => {
      if (registry.users === 0 && registries.get(doc) === registry) teardown(doc, registry);
    }, 0);
  };
}

/**
 * Say `message` through the shared region. The region is cleared first and the
 * message set on the next frame, so the same words said again later are read
 * again; the same words posted twice before they land are read once. With no
 * region mounted yet, or the last user releasing them, the regions are mounted
 * for the life of the document, so the message is never dropped with them.
 */
export function announce(
  message: string,
  politeness: Politeness = "polite",
  doc: Document = document
) {
  let registry = registries.get(doc);
  if (!registry || registry.removal !== null) {
    mountAnnouncer(doc);
    registry = registries.get(doc);
  }
  if (!registry || !message) return;
  const view = doc.defaultView;
  const pending = registry.pending[politeness];
  if (pending?.message === message) return;
  if (pending) view?.cancelAnimationFrame(pending.frame);
  const region = registry.regions[politeness];
  region.textContent = "";
  const target = registry;
  const frame =
    view?.requestAnimationFrame(() => {
      target.pending[politeness] = null;
      region.textContent = message;
    }) ?? 0;
  registry.pending[politeness] = { message, frame };
}
