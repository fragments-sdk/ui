import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announce, mountAnnouncer } from "./announcer";

function regions() {
  return {
    polite: document.querySelectorAll<HTMLElement>('[data-fui-announcer="polite"]'),
    assertive: document.querySelectorAll<HTMLElement>('[data-fui-announcer="assertive"]'),
  };
}

describe("announcer", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame"] });
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    for (const region of document.querySelectorAll("[data-fui-announcer]")) region.remove();
  });

  it("mounts one polite and one assertive region, empty, shared by every user", () => {
    const releaseA = mountAnnouncer();
    const releaseB = mountAnnouncer();
    const { polite, assertive } = regions();
    expect(polite).toHaveLength(1);
    expect(assertive).toHaveLength(1);
    expect(polite[0]!.textContent).toBe("");
    expect(polite[0]!.getAttribute("role")).toBe("status");
    expect(polite[0]!.getAttribute("aria-live")).toBe("polite");
    expect(assertive[0]!.getAttribute("role")).toBe("alert");
    expect(assertive[0]!.getAttribute("aria-atomic")).toBe("true");
    releaseA();
    vi.runAllTimers();
    expect(regions().polite).toHaveLength(1);
    releaseB();
    vi.runAllTimers();
    expect(regions().polite).toHaveLength(0);
  });

  it("keeps the regions across a release and remount in the same task", () => {
    const release = mountAnnouncer();
    const region = regions().polite[0];
    release();
    const again = mountAnnouncer();
    vi.runAllTimers();
    expect(regions().polite[0]).toBe(region);
    again();
  });

  it("announces a message posted twice before it lands once", () => {
    const release = mountAnnouncer();
    const region = regions().polite[0]!;
    const writes: string[] = [];
    const observer = new MutationObserver(() => {
      if (region.textContent) writes.push(region.textContent);
    });
    observer.observe(region, { childList: true, characterData: true, subtree: true });
    announce("Changes saved");
    announce("Changes saved");
    expect(region.textContent).toBe("");
    vi.runAllTimers();
    expect(region.textContent).toBe("Changes saved");
    return Promise.resolve().then(() => {
      observer.disconnect();
      expect(writes).toEqual(["Changes saved"]);
      release();
    });
  });

  it("says the same words again when they are posted after they landed", () => {
    const release = mountAnnouncer();
    const region = regions().assertive[0]!;
    announce("Couldn't save", "assertive");
    vi.runAllTimers();
    announce("Couldn't save", "assertive");
    expect(region.textContent).toBe("");
    vi.runAllTimers();
    expect(region.textContent).toBe("Couldn't save");
    release();
  });

  // Keep last: the regions this test adopts stay for the life of the document.
  it("keeps the regions when a message is posted while the last user releases them", () => {
    const release = mountAnnouncer();
    const region = regions().polite[0]!;
    release();
    announce("Changes saved");
    vi.runAllTimers();
    expect(region.isConnected).toBe(true);
    expect(regions().polite[0]).toBe(region);
    expect(region.textContent).toBe("Changes saved");
  });
});
