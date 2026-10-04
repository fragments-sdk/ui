/**
 * State fixtures for Sidebar, rendered by `pnpm run test:states`.
 *
 * @family:shell
 * @na:error Navigation has no failure state of its own; a row that cannot load is disabled.
 */
import { Sidebar } from ".";
import {
  ChartBar,
  Cube,
  FileText,
  Flag,
  Folder,
  GearSix,
  SquaresFour,
  TerminalWindow,
} from "@phosphor-icons/react";
import { Header } from "../Header";
import { belowBreakpointQuery } from "../../utils/breakpoints";

const frame = { blockSize: 360, display: "flex" } as const;

export function populated() {
  return (
    <div style={frame}>
      <Sidebar aria-label="Workspace">
        <Sidebar.Header>Workspace</Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section label="Workspace">
            <Sidebar.Item
              icon={<SquaresFour size={16} aria-hidden="true" />}
              href="#overview"
              active
            >
              Overview
            </Sidebar.Item>
            <Sidebar.Item icon={<Flag size={16} aria-hidden="true" />} href="#findings" badge="12">
              Findings
            </Sidebar.Item>
            <Sidebar.Item icon={<FileText size={16} aria-hidden="true" />} href="#contract">
              Contract
            </Sidebar.Item>
          </Sidebar.Section>
          <Sidebar.Section label="Administration">
            <Sidebar.Item
              icon={<GearSix size={16} aria-hidden="true" />}
              hasSubmenu
              defaultExpanded
            >
              Settings
            </Sidebar.Item>
            <Sidebar.Submenu>
              <Sidebar.SubItem href="#general">General</Sidebar.SubItem>
              <Sidebar.SubItem href="#members">Members</Sidebar.SubItem>
            </Sidebar.Submenu>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </Sidebar>
    </div>
  );
}

export function populatedCollapsed() {
  return (
    <div style={frame}>
      <Sidebar aria-label="Workspace" defaultCollapsed>
        <Sidebar.Nav>
          <Sidebar.Section label="Workspace">
            <Sidebar.Item
              icon={<SquaresFour size={16} aria-hidden="true" />}
              href="#overview"
              active
            >
              Overview
            </Sidebar.Item>
            <Sidebar.Item icon={<Flag size={16} aria-hidden="true" />} href="#findings">
              Findings
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer>
          <Sidebar.CollapseToggle />
        </Sidebar.Footer>
      </Sidebar>
    </div>
  );
}

export function empty() {
  return (
    <div style={frame}>
      <Sidebar aria-label="Workspace">
        <Sidebar.Header>Workspace</Sidebar.Header>
        <Sidebar.Nav>
          <Sidebar.Section label="Repositories">{null}</Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    </div>
  );
}

export function loading() {
  return (
    <div style={frame}>
      <Sidebar aria-label="Workspace">
        <Sidebar.Nav>
          <Sidebar.Section label="Workspace">
            <Sidebar.MenuSkeleton count={4} />
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    </div>
  );
}

export function overflow() {
  return (
    <div style={frame}>
      <Sidebar aria-label="Workspace">
        <Sidebar.Nav>
          <Sidebar.Section label="Repositories with very long names">
            <Sidebar.Item icon={<Folder size={16} aria-hidden="true" />} badge="128" active>
              design-system-governance-contract-web
            </Sidebar.Item>
            {Array.from({ length: 14 }, (_, index) => (
              <Sidebar.Item key={index} icon={<Folder size={16} aria-hidden="true" />}>
                {`service-${index + 1}`}
              </Sidebar.Item>
            ))}
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    </div>
  );
}

export function lifecycle() {
  return (
    <div style={frame}>
      <Sidebar aria-label="Workspace">
        <Sidebar.Nav>
          <Sidebar.Section label="States" collapsible>
            <Sidebar.Item icon={<SquaresFour size={16} aria-hidden="true" />}>Rest</Sidebar.Item>
            <Sidebar.Item icon={<Flag size={16} aria-hidden="true" />} data-states-interact="hover">
              Hover
            </Sidebar.Item>
            <Sidebar.Item
              icon={<FileText size={16} aria-hidden="true" />}
              data-states-interact="press"
            >
              Press
            </Sidebar.Item>
            <Sidebar.Item
              icon={<ChartBar size={16} aria-hidden="true" />}
              active
              data-states-interact="hover"
            >
              Current
            </Sidebar.Item>
            <Sidebar.Item icon={<Cube size={16} aria-hidden="true" />} data-states-interact="focus">
              Focus
            </Sidebar.Item>
            <Sidebar.Item icon={<TerminalWindow size={16} aria-hidden="true" />} working>
              Working
            </Sidebar.Item>
            <Sidebar.Item icon={<GearSix size={16} aria-hidden="true" />} disabled>
              Disabled
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    </div>
  );
}

function MobileNav() {
  return (
    <Sidebar aria-label="Workspace">
      <Sidebar.Header>Workspace</Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section label="Workspace">
          <Sidebar.Item icon={<SquaresFour size={16} aria-hidden="true" />} href="#overview" active>
            Overview
          </Sidebar.Item>
          <Sidebar.Item icon={<Flag size={16} aria-hidden="true" />} href="#findings">
            Findings
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
    </Sidebar>
  );
}

// Below md the rail is a modal panel: closed, the header trigger is the way in.
// From md up the trigger is hidden (the rail is in view), so only a narrow
// viewport focuses it.
export function lifecycleMobileClosed() {
  const belowMd = window.matchMedia(belowBreakpointQuery("md")).matches;
  return (
    <Sidebar.Provider>
      <Header>
        <Header.Trigger data-states-interact={belowMd ? "focus" : undefined} />
        <Header.Brand href="#home">Workspace</Header.Brand>
      </Header>
      <div style={frame}>
        <MobileNav />
      </div>
    </Sidebar.Provider>
  );
}

// Below md, open: the panel over a scrim, focus held inside, a visible close.
// From md up the same markup is the rail beside the bar.
export function lifecycleMobileOpen() {
  return (
    <Sidebar.Provider defaultOpen>
      <Header>
        <Header.Trigger />
        <Header.Brand href="#home">Workspace</Header.Brand>
      </Header>
      <div style={frame}>
        <MobileNav />
      </div>
    </Sidebar.Provider>
  );
}
