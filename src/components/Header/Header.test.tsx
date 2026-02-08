import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
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
