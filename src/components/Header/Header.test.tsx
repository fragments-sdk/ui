import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from '../../test/utils';
import { Header } from './index';

describe('Header', () => {
  it('renders as a banner landmark (header element)', () => {
    render(
      <Header>
        <Header.Brand>Logo</Header.Brand>
      </Header>
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders Brand slot content', () => {
    render(
      <Header>
        <Header.Brand>My App</Header.Brand>
      </Header>
    );
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders Brand as a link when href is provided', () => {
    render(
      <Header>
        <Header.Brand href="/">Home</Header.Brand>
      </Header>
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link).toHaveAttribute('href', '/');
  });

  it('renders navigation with accessible label', () => {
    render(
      <Header>
        <Header.Nav aria-label="Primary navigation">
          <Header.NavItem href="/about">About</Header.NavItem>
          <Header.NavItem href="/contact">Contact</Header.NavItem>
        </Header.Nav>
      </Header>
    );
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'About' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('marks active NavItem with aria-current="page"', () => {
    render(
      <Header>
        <Header.Nav>
          <Header.NavItem href="/about" active>About</Header.NavItem>
          <Header.NavItem href="/contact">Contact</Header.NavItem>
        </Header.Nav>
      </Header>
    );
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Contact' })).not.toHaveAttribute('aria-current');
  });

  it('composes Header.NavItem asChild click handlers and forwards extra props', async () => {
    const user = userEvent.setup();
    const parentClick = vi.fn();
    const childClick = vi.fn();

    render(
      <Header>
        <Header.Nav aria-label="Main">
          <Header.NavItem asChild onClick={parentClick} data-testid="nav-item-link">
            <a href="/docs" onClick={childClick}>Docs</a>
          </Header.NavItem>
        </Header.Nav>
      </Header>
    );

    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link).toHaveAttribute('data-testid', 'nav-item-link');
    await user.click(link);
    expect(childClick).toHaveBeenCalled();
    expect(parentClick).toHaveBeenCalled();
  });

  it('renders Actions slot', () => {
    render(
      <Header>
        <Header.Actions>
          <button>Sign In</button>
        </Header.Actions>
      </Header>
    );
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('Header.Trigger composes onClick and forwards button props', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: true,
        media: '(max-width: 767px)',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <Header>
        <Header.Trigger data-testid="header-trigger" onClick={onClick} />
      </Header>
    );

    const trigger = await screen.findByTestId('header-trigger');
    await user.click(trigger);
    expect(onClick).toHaveBeenCalled();

    Object.defineProperty(window, 'matchMedia', { writable: true, value: originalMatchMedia });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Header>
        <Header.Brand>Logo</Header.Brand>
        <Header.Nav aria-label="Main">
          <Header.NavItem href="/home">Home</Header.NavItem>
        </Header.Nav>
      </Header>
    );
    await expectNoA11yViolations(container);
  });
});

describe('Header.NavMenu', () => {
  it('renders a trigger button with the label', () => {
    render(
      <Header>
        <Header.Nav>
          <Header.NavMenu label="Docs">
            <Header.NavMenuItem href="/cli">CLI</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
      </Header>
    );
    expect(screen.getByRole('button', { name: /Docs/ })).toBeInTheDocument();
  });

  it('opens dropdown on click and shows menu items', async () => {
    const user = userEvent.setup();
    render(
      <Header>
        <Header.Nav>
          <Header.NavMenu label="Docs">
            <Header.NavMenuItem href="/cli">CLI Reference</Header.NavMenuItem>
            <Header.NavMenuItem href="/mcp">MCP Tools</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
      </Header>
    );

    await user.click(screen.getByRole('button', { name: /Docs/ }));
    await waitFor(() => {
      expect(screen.getByText('CLI Reference')).toBeInTheDocument();
      expect(screen.getByText('MCP Tools')).toBeInTheDocument();
    });
  });

  it('applies active class to trigger when active prop is true', () => {
    render(
      <Header>
        <Header.Nav>
          <Header.NavMenu label="Docs" active>
            <Header.NavMenuItem href="/cli">CLI</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
      </Header>
    );
    const trigger = screen.getByRole('button', { name: /Docs/ });
    expect(trigger.className).toMatch(/navItemActive/);
  });

  it('renders NavMenuItem with href as a link', async () => {
    const user = userEvent.setup();
    render(
      <Header>
        <Header.Nav>
          <Header.NavMenu label="Docs">
            <Header.NavMenuItem href="/getting-started">Getting Started</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
      </Header>
    );

    await user.click(screen.getByRole('button', { name: /Docs/ }));
    await waitFor(() => {
      const item = screen.getByText('Getting Started');
      const link = item.closest('a') || item;
      expect(link).toHaveAttribute('href', '/getting-started');
    });
  });

  it('applies active class to NavMenuItem when active', async () => {
    const user = userEvent.setup();
    render(
      <Header>
        <Header.Nav>
          <Header.NavMenu label="Docs">
            <Header.NavMenuItem href="/cli" active>CLI</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
      </Header>
    );

    await user.click(screen.getByRole('button', { name: /Docs/ }));
    await waitFor(() => {
      const item = screen.getByText('CLI');
      expect(item.className).toMatch(/navMenuItemActive/);
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Header>
        <Header.Nav aria-label="Main">
          <Header.NavItem href="/home">Home</Header.NavItem>
          <Header.NavMenu label="Docs">
            <Header.NavMenuItem href="/cli">CLI</Header.NavMenuItem>
            <Header.NavMenuItem href="/mcp">MCP</Header.NavMenuItem>
          </Header.NavMenu>
        </Header.Nav>
      </Header>
    );
    await expectNoA11yViolations(container, {
      disabledRules: ['aria-command-name'],
    });
  });
});
