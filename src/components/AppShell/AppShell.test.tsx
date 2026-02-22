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
        <AppShell.Main>Content</AppShell.Main>
      </AppShell>
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundColor).toBe('rgb(1, 2, 3)');
    expect(root.style.getPropertyValue('--appshell-header-height')).toBe('56px');
  });
});
