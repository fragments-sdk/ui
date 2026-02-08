import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Sidebar } from './index';

// Mock matchMedia for jsdom
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
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

  it('has no accessibility violations', async () => {
    const { container } = renderSidebar();
    await expectNoA11yViolations(container);
  });
});
