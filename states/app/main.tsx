// The state harness page. Renders one fixture per load:
//   ?fixture=<Subject>/<state>&theme=<light|dark>
// and reports through attributes on <html>:
//   data-states-status = "loading" | "ready" | "error"
//   data-states-error  = the message when status is "error"
import { Component, StrictMode, type ComponentType, type ErrorInfo, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/globals.scss";

type FixtureModule = Record<string, unknown>;

const loaders = import.meta.glob<FixtureModule>("../../src/**/*.states.tsx");
const SUFFIX = ".states.tsx";
const WAIT_LIMIT_MS = 10_000;

const bySubject = new Map<string, () => Promise<FixtureModule>>();
for (const [path, load] of Object.entries(loaders)) {
  bySubject.set(path.slice(path.lastIndexOf("/") + 1, -SUFFIX.length), load);
}

const root = document.documentElement;

function setStatus(status: "loading" | "ready" | "error", message?: string) {
  if (root.dataset.statesStatus === "error") return;
  root.dataset.statesStatus = status;
  if (message) root.dataset.statesError = message;
}

window.addEventListener("error", (event) => setStatus("error", String(event.message)));
window.addEventListener("unhandledrejection", (event) =>
  setStatus("error", `Unhandled rejection: ${String(event.reason)}`)
);

class FixtureBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    setStatus("error", `${error.message}${info.componentStack ?? ""}`);
  }

  render() {
    if (this.state.error) return <pre role="alert">{this.state.error.message}</pre>;
    return this.props.children;
  }
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function settle() {
  await document.fonts.ready;
  await nextFrame();
  await nextFrame();
  // A fixture that loads something async marks it with data-states-wait until it is done.
  const started = performance.now();
  while (document.querySelector("[data-states-wait]")) {
    if (performance.now() - started > WAIT_LIMIT_MS) {
      setStatus("error", "data-states-wait never cleared");
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  await nextFrame();
  setStatus("ready");
}

function Index() {
  return (
    <main id="states-root">
      <h1>State fixtures</h1>
      <ul>
        {[...bySubject.keys()].sort().map((subject) => (
          <li key={subject}>{subject}</li>
        ))}
      </ul>
    </main>
  );
}

async function start() {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get("theme") === "dark" ? "dark" : "light";
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
  setStatus("loading");

  const container = document.getElementById("app");
  if (!container) throw new Error("#app is missing");
  const reactRoot = createRoot(container);

  const id = params.get("fixture");
  if (!id) {
    reactRoot.render(<Index />);
    await settle();
    return;
  }

  const [subject, state] = id.split("/");
  const load = bySubject.get(subject ?? "");
  if (!load || !state) {
    setStatus("error", `Unknown fixture "${id}"`);
    return;
  }
  const module = await load();
  const Fixture = module[state] as ComponentType | undefined;
  if (typeof Fixture !== "function") {
    setStatus("error", `${subject}.states.tsx has no fixture "${state}"`);
    return;
  }

  reactRoot.render(
    <StrictMode>
      <main
        id="states-root"
        data-fixture={id}
        style={{ padding: 24, width: "fit-content", maxWidth: "100%", boxSizing: "border-box" }}
      >
        <FixtureBoundary>
          <Fixture />
        </FixtureBoundary>
      </main>
    </StrictMode>
  );
  await settle();
}

start().catch((error: unknown) => setStatus("error", String(error)));
