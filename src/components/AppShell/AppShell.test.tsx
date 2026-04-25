import { describe, it, expect, vi } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { AppShell } from './index';

// Mock matchMedia for Sidebar/AppShell which use useIsMobile
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('AppShell', () => {
  it('renders children in a layout container', () => {
    render(
      <AppShell>
        <AppShell.Main>Main Content</AppShell.Main>
      </AppShell>
    );
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('renders the main region with role="main"', () => {
    render(
      <AppShell>
        <AppShell.Main>Content</AppShell.Main>
      </AppShell>
    );
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders header, sidebar, and main slots', () => {
    render(
      <AppShell>
        <AppShell.Header>Header Content</AppShell.Header>
        <AppShell.Sidebar>Sidebar Content</AppShell.Sidebar>
        <AppShell.Main>Main Content</AppShell.Main>
      </AppShell>
    );
    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByText('Sidebar Content')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('renders aside slot when visible', () => {
    render(
      <AppShell>
        <AppShell.Main>Main</AppShell.Main>
        <AppShell.Aside visible>Aside Panel</AppShell.Aside>
      </AppShell>
    );
    expect(screen.getByText('Aside Panel')).toBeInTheDocument();
  });

  it('hides aside when visible is false', () => {
    render(
      <AppShell>
        <AppShell.Main>Main</AppShell.Main>
        <AppShell.Aside visible={false}>Hidden Aside</AppShell.Aside>
      </AppShell>
    );
    expect(screen.queryByText('Hidden Aside')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <AppShell>
        <AppShell.Main>Content</AppShell.Main>
      </AppShell>
    );
    await expectNoA11yViolations(container);
  });

  it('preserves root style props while applying internal CSS variables', () => {
    const { container } = render(
      <AppShell style={{ backgroundColor: 'rgb(1, 2, 3)' }}>
        <AppShell.Header>Header</AppShell.Header>
        <AppShell.Main>Content</AppShell.Main>
      </AppShell>
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundColor).toBe('rgb(1, 2, 3)');
    expect(root.style.getPropertyValue('--appshell-header-height')).toBe('56px');
  });

  it('collapses header track to 0px when no AppShell.Header is rendered', () => {
    const { container } = render(
      <AppShell>
        <AppShell.Main>Content</AppShell.Main>
      </AppShell>
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue('--appshell-header-height')).toBe('0px');
  });

  describe('layout structures', () => {
    it('sets data-layout="default" for default layout', () => {
      const { container } = render(
        <AppShell layout="default">
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      );
      expect(container.querySelector('[data-layout="default"]')).toBeInTheDocument();
    });

    it('sets data-layout="sidebar" for sidebar layout', () => {
      const { container } = render(
        <AppShell layout="sidebar">
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      );
      expect(container.querySelector('[data-layout="sidebar"]')).toBeInTheDocument();
    });
  });

  describe('legacy layout backwards compatibility', () => {
    it('accepts layout="sidebar-floating" and resolves to sidebar structure', () => {
      const { container } = render(
        <AppShell layout="sidebar-floating">
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      );
      // data-layout preserves original value for E2E tests
      expect(container.querySelector('[data-layout="sidebar-floating"]')).toBeInTheDocument();
    });

    it('accepts layout="floating" and resolves to sidebar structure', () => {
      const { container } = render(
        <AppShell layout="floating">
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      );
      expect(container.querySelector('[data-layout="floating"]')).toBeInTheDocument();
    });
  });

  describe('per-slot variant prop', () => {
    it('accepts variant="floating" on AppShell.Main', () => {
      render(
        <AppShell layout="sidebar">
          <AppShell.Main variant="floating">Content</AppShell.Main>
        </AppShell>
      );
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('accepts variant="floating" on AppShell.Aside', () => {
      render(
        <AppShell layout="sidebar">
          <AppShell.Main>Content</AppShell.Main>
          <AppShell.Aside variant="floating">Aside</AppShell.Aside>
        </AppShell>
      );
      expect(screen.getByText('Aside')).toBeInTheDocument();
    });

    it('accepts variant="floating" on AppShell.Sidebar', () => {
      render(
        <AppShell layout="sidebar">
          <AppShell.Sidebar variant="floating">Nav</AppShell.Sidebar>
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      );
      expect(screen.getByText('Nav')).toBeInTheDocument();
    });
  });

  describe('per-slot bg prop', () => {
    it('applies bg to AppShell.Main as inline backgroundColor', () => {
      render(
        <AppShell>
          <AppShell.Main bg="rgb(10, 20, 30)">Content</AppShell.Main>
        </AppShell>
      );
      expect(screen.getByRole('main').style.backgroundColor).toBe('rgb(10, 20, 30)');
    });

    it('applies bg to AppShell.Header as inline backgroundColor', () => {
      const { container } = render(
        <AppShell>
          <AppShell.Header bg="rgb(40, 50, 60)">Header</AppShell.Header>
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      );
      const header = container.querySelector('[class*="header"]') as HTMLElement;
      expect(header.style.backgroundColor).toBe('rgb(40, 50, 60)');
    });

    it('applies bg to AppShell.Aside as inline backgroundColor', () => {
      render(
        <AppShell>
          <AppShell.Main>Content</AppShell.Main>
          <AppShell.Aside bg="rgb(70, 80, 90)">Aside</AppShell.Aside>
        </AppShell>
      );
      const aside = screen.getByText('Aside').closest('aside') as HTMLElement;
      expect(aside.style.backgroundColor).toBe('rgb(70, 80, 90)');
    });

    it('applies bg to AppShell.Sidebar via inline style on inner Sidebar', () => {
      const { container } = render(
        <AppShell>
          <AppShell.Sidebar bg="rgb(100, 110, 120)">Nav</AppShell.Sidebar>
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      );
      // The bg is applied as inline backgroundColor on the inner Sidebar <aside> root
      const sidebarAside = container.querySelector('[class*="sidebar"] > aside') as HTMLElement;
      expect(sidebarAside.style.backgroundColor).toBe('rgb(100, 110, 120)');
    });

    it('applies bg to AppShell root', () => {
      const { container } = render(
        <AppShell bg="rgb(5, 10, 15)">
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      );
      const root = container.firstElementChild as HTMLElement;
      expect(root.style.backgroundColor).toBe('rgb(5, 10, 15)');
    });

    it('does not set backgroundColor when bg is not provided', () => {
      render(
        <AppShell>
          <AppShell.Main>Content</AppShell.Main>
        </AppShell>
      );
      expect(screen.getByRole('main').style.backgroundColor).toBe('');
    });
  });
});
