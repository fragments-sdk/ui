/**
 * State fixtures for AppShell, rendered by `pnpm run test:states`.
 *
 * @family:shell
 * @na:empty The frame always holds a main slot; its emptiness is the page's empty state.
 * @na:loading The frame renders at once; loading belongs to the page inside it.
 * @na:error The frame has no failure state; errors belong to the page inside it.
 */
import { AppShell } from ".";
import { Header } from "../Header";
import { Main } from "../Main";
import { Sidebar } from "../Sidebar";

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
    </svg>
  );
}

function Nav() {
  return (
    <Sidebar.Nav>
      <Sidebar.Section label="Workspace">
        <Sidebar.Item icon={<Glyph />} href="#overview" active>
          Overview
        </Sidebar.Item>
        <Sidebar.Item icon={<Glyph />} href="#findings">
          Findings
        </Sidebar.Item>
      </Sidebar.Section>
    </Sidebar.Nav>
  );
}

function Page() {
  return (
    <Main>
      <Main.Header>
        <Main.Title>Overview</Main.Title>
        <Main.Description>
          <p>Every repository passed its last check.</p>
        </Main.Description>
      </Main.Header>
    </Main>
  );
}

export function populated() {
  return (
    <AppShell style={{ blockSize: 360 }}>
      <AppShell.Header>
        <Header>
          <Header.Trigger />
          <Header.Brand href="#home">Fragments</Header.Brand>
        </Header>
      </AppShell.Header>
      <AppShell.Sidebar>
        <Nav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
    </AppShell>
  );
}

export function populatedSidebarLayout() {
  return (
    <AppShell layout="sidebar" style={{ blockSize: 360 }}>
      <AppShell.Header>
        <Header>
          <Header.Trigger />
          <Header.Brand href="#home">Fragments</Header.Brand>
        </Header>
      </AppShell.Header>
      <AppShell.Sidebar>
        <Sidebar.Header>Fragments</Sidebar.Header>
        <Nav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
      <AppShell.Aside aria-label="Details">
        <Main as="div">
          <Main.Header>
            <Main.Title as="h2">Details</Main.Title>
          </Main.Header>
        </Main>
      </AppShell.Aside>
    </AppShell>
  );
}

export function overflow() {
  return (
    <AppShell style={{ blockSize: 280 }}>
      <AppShell.Sidebar>
        <Nav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Main>
          {Array.from({ length: 12 }, (_, index) => (
            <p key={index}>Row {index + 1} of a page taller than the frame; main scrolls alone.</p>
          ))}
        </Main>
      </AppShell.Main>
    </AppShell>
  );
}

export function lifecycle() {
  return (
    <AppShell defaultCollapsed style={{ blockSize: 280 }}>
      <AppShell.Sidebar>
        <Nav />
        <Sidebar.Footer>
          <Sidebar.CollapseToggle data-states-interact="hover focus" />
        </Sidebar.Footer>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
    </AppShell>
  );
}

// Below md the sidebar is a modal panel over a scrim, opened from the header
// trigger; from md up the same markup is the rail.
export function lifecycleMobileOpen() {
  return (
    <AppShell defaultOpen style={{ blockSize: 360 }}>
      <AppShell.Header>
        <Header>
          <Header.Trigger />
          <Header.Brand href="#home">Fragments</Header.Brand>
        </Header>
      </AppShell.Header>
      <AppShell.Sidebar>
        <Nav />
      </AppShell.Sidebar>
      <AppShell.Main>
        <Page />
      </AppShell.Main>
    </AppShell>
  );
}
