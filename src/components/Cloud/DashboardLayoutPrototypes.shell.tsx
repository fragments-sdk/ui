import type { ReactNode } from "react";
import {
  Clock,
  Gear,
  GitBranch,
  GitPullRequest,
  House,
  ListChecks,
  ShieldCheck,
} from "@phosphor-icons/react";
import { AppShell } from "../AppShell";
import { Avatar } from "../Avatar";
import { Box } from "../Box";
import { Button } from "../Button";
import { Sidebar } from "../Sidebar";
import { Stack } from "../Stack";
import { Text } from "../Text";
import styles from "./DashboardLayoutPrototypes.module.scss";

export type CloudNavLabel =
  | "Dashboard"
  | "Pull Requests"
  | "Backlog"
  | "Governance"
  | "Developer setup"
  | "Settings";

function SidebarBrand() {
  return (
    <Stack direction="row" align="center" gap="sm">
      <Box as="span" className={styles.brandMark}>
        <GitBranch size={16} weight="bold" />
      </Box>
      <Stack gap="none" className={styles.truncate}>
        <Text variant="section-label" color="tertiary" truncate>
          Active repository
        </Text>
        <Text size="sm" weight="semibold" truncate>
          fragments-sdk/ui
        </Text>
      </Stack>
    </Stack>
  );
}

function CloudSidebar({ activeNav }: { activeNav: CloudNavLabel }) {
  return (
    <>
      <Sidebar.Header>
        <SidebarBrand />
      </Sidebar.Header>
      <Sidebar.Nav>
        <Sidebar.Section>
          <Sidebar.Item icon={<House size={18} />} active={activeNav === "Dashboard"}>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item icon={<GitPullRequest size={18} />} active={activeNav === "Pull Requests"}>
            Pull Requests
          </Sidebar.Item>
          <Sidebar.Item icon={<ListChecks size={18} />} active={activeNav === "Backlog"} badge={7}>
            Backlog
          </Sidebar.Item>
          <Sidebar.Item icon={<ShieldCheck size={18} />} active={activeNav === "Governance"}>
            Governance
          </Sidebar.Item>
        </Sidebar.Section>
        <Sidebar.Section label="Setup">
          <Sidebar.Item icon={<Clock size={18} />} active={activeNav === "Developer setup"}>
            Developer setup
          </Sidebar.Item>
          <Sidebar.Item icon={<Gear size={18} />} active={activeNav === "Settings"}>
            Settings
          </Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>
        <Stack direction="row" align="center" gap="sm">
          <Avatar initials="T" name="Test User" size="md" />
          <Stack gap="none" className={styles.truncate}>
            <Text size="sm" weight="semibold" truncate>
              Test User
            </Text>
            <Text size="2xs" color="tertiary" truncate>
              dev_test@app.usefragments.com
            </Text>
          </Stack>
        </Stack>
      </Sidebar.Footer>
    </>
  );
}

export function PrototypeShell({
  activeNav = "Dashboard",
  eyebrow,
  title,
  description = "Design contract coverage, drift budgets, and release readiness.",
  actions,
  children,
}: {
  activeNav?: CloudNavLabel;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box className={styles.frame}>
      <AppShell layout="sidebar" bg="var(--fui-app-canvas-bg)" className={styles.shell}>
        <AppShell.Sidebar width="260px" collapsible="offcanvas">
          <CloudSidebar activeNav={activeNav} />
        </AppShell.Sidebar>
        <AppShell.Main padding="none" className={styles.main}>
          <Stack as="main" gap="lg" className={styles.page}>
            <Stack direction="row" justify="between" align="start" gap="md" wrap>
              <Stack gap="xs" className={styles.heading}>
                {eyebrow ? (
                  <Text variant="section-label" color="tertiary">
                    {eyebrow}
                  </Text>
                ) : null}
                <Text as="h1" size="xl" weight="bold">
                  {title}
                </Text>
                <Text as="p" size="sm" color="secondary">
                  {description}
                </Text>
              </Stack>
              {actions ?? (
                <Stack direction="row" gap="sm" wrap>
                  <Button variant="outlined" size="sm">
                    View reports
                  </Button>
                  <Button variant="secondary" size="sm">
                    Learn more
                  </Button>
                </Stack>
              )}
            </Stack>
            {children}
          </Stack>
        </AppShell.Main>
      </AppShell>
    </Box>
  );
}
