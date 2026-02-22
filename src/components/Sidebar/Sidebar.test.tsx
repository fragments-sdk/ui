import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Sidebar } from './index';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock matchMedia for jsdom
beforeAll(() => {
  mockMatchMedia(false);
});

function renderSidebar(props: Partial<React.ComponentProps<typeof Sidebar>> = {}) {
  return render(
    <Sidebar aria-label="Test sidebar" {...props}>
      <Sidebar.Header>Header Content</Sidebar.Header>
      <Sidebar.Nav aria-label="Main">
        <Sidebar.Section label="Section One">
          <Sidebar.Item icon={<span>I</span>}>Dashboard</Sidebar.Item>
          <Sidebar.Item icon={<span>I</span>} active>Settings</Sidebar.Item>
          <Sidebar.Item icon={<span>I</span>} disabled>Disabled</Sidebar.Item>
        </Sidebar.Section>
      </Sidebar.Nav>
      <Sidebar.Footer>Footer Content</Sidebar.Footer>
    </Sidebar>
  );
}

describe('Sidebar', () => {
  it('renders as an aside element', () => {
    renderSidebar();
    const aside = document.querySelector('aside');
    expect(aside).toBeInTheDocument();
  });

  it('renders compound sub-components', () => {
    renderSidebar();
    expect(screen.getByText('Header Content')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('renders nav landmark', () => {
    renderSidebar();
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument();
  });

  it('uses ScrollArea with fade indicators in nav content', () => {
    renderSidebar();
    const scrollAreaRoot = screen.getByRole('navigation', { name: /main/i }).querySelector('[data-orientation="vertical"]');
    expect(scrollAreaRoot).toBeInTheDocument();
  });

  it('renders section with label', () => {
    renderSidebar();
    expect(screen.getByText('Section One')).toBeInTheDocument();
  });

  it('marks active item with aria-current="page"', () => {
    renderSidebar();
    const activeItem = screen.getByText('Settings').closest('[aria-current]');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
  });

  it('disables items with disabled prop', () => {
    renderSidebar();
    const disabledItem = screen.getByText('Disabled').closest('button');
    expect(disabledItem).toHaveAttribute('tabindex', '-1');
  });

  it('supports data-state attribute', () => {
    renderSidebar();
    const aside = document.querySelector('aside');
    expect(aside).toHaveAttribute('data-state');
  });

  it('uses icon collapse width when collapsed with icons', () => {
    renderSidebar({ collapsed: true });
    const aside = document.querySelector('aside');
    expect(aside).toHaveStyle('--sidebar-effective-collapsed-width: 56px');
    expect(aside).toHaveAttribute('data-icon-collapse', 'icons');
  });

  it('collapses fully when collapsed with no item icons and keeps toggle visible', () => {
    render(
      <Sidebar collapsed aria-label="Text-only sidebar">
        <Sidebar.Header>
          Header Content
          <Sidebar.CollapseToggle />
        </Sidebar.Header>
        <Sidebar.Nav aria-label="Main">
          <Sidebar.Section label="Section One">
            <Sidebar.Item>Dashboard</Sidebar.Item>
            <Sidebar.Item active>Settings</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );

    const aside = document.querySelector('aside');
    expect(aside).toHaveStyle('--sidebar-effective-collapsed-width: 0px');
    expect(aside).toHaveAttribute('data-icon-collapse', 'none');
    expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
  });

  it('composes child click handler in Sidebar.Item asChild mode', async () => {
    const user = userEvent.setup();
    const childClick = vi.fn();
    const onItemClick = vi.fn();

    render(
      <Sidebar aria-label="Test sidebar">
        <Sidebar.Nav aria-label="Main">
          <Sidebar.Section label="Section One">
            <Sidebar.Item asChild icon={<span>I</span>} onClick={onItemClick}>
              <a href="#dashboard" onClick={childClick}>Dashboard</a>
            </Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );

    await user.click(screen.getByRole('link', { name: /dashboard/i }));

    expect(childClick).toHaveBeenCalled();
    expect(onItemClick).toHaveBeenCalled();
  });

  it('forwards html props to desktop compound parts', () => {
    render(
      <Sidebar aria-label="Test sidebar">
        <Sidebar.Header data-testid="header" data-part="header">Header</Sidebar.Header>
        <Sidebar.Nav aria-label="Main" data-testid="nav" data-part="nav">
          <Sidebar.Section data-testid="section" data-part="section" label="Section One">
            <Sidebar.Item icon={<span>I</span>}>Dashboard</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
        <Sidebar.Footer data-testid="footer" data-part="footer">Footer</Sidebar.Footer>
        <Sidebar.CollapseToggle data-testid="collapse-toggle" data-part="collapse-toggle" />
        <Sidebar.Rail data-testid="rail" data-part="rail" />
      </Sidebar>
    );

    expect(screen.getByTestId('header')).toHaveAttribute('data-part', 'header');
    expect(screen.getByTestId('nav')).toHaveAttribute('data-part', 'nav');
    expect(screen.getByTestId('section')).toHaveAttribute('data-part', 'section');
    expect(screen.getByTestId('footer')).toHaveAttribute('data-part', 'footer');
    expect(screen.getByTestId('collapse-toggle')).toHaveAttribute('data-part', 'collapse-toggle');
    expect(screen.getByTestId('rail')).toHaveAttribute('data-part', 'rail');
  });

  it('forwards props to mobile Trigger/Overlay and composes overlay click', async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    const overlayClick = vi.fn();

    render(
      <Sidebar defaultOpen aria-label="Mobile sidebar">
        <Sidebar.Trigger data-testid="trigger" data-part="trigger" />
        <Sidebar.Overlay data-testid="overlay" data-part="overlay" onClick={overlayClick} />
        <Sidebar.Nav aria-label="Main">
          <Sidebar.Section label="Section One">
            <Sidebar.Item icon={<span>I</span>}>Dashboard</Sidebar.Item>
          </Sidebar.Section>
        </Sidebar.Nav>
      </Sidebar>
    );

    const trigger = await screen.findByTestId('trigger');
    const overlay = await screen.findByTestId('overlay');

    expect(trigger).toHaveAttribute('data-part', 'trigger');
    expect(overlay).toHaveAttribute('data-part', 'overlay');

    await user.click(overlay);
    expect(overlayClick).toHaveBeenCalled();

    mockMatchMedia(false);
  });

  it('has no accessibility violations', async () => {
    const { container } = renderSidebar();
    await expectNoA11yViolations(container);
  });
});
