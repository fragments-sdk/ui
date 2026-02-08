import { describe, it, expect } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Breadcrumbs } from './index';

describe('Breadcrumbs', () => {
  it('renders a nav landmark with aria-label "Breadcrumb"', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item current>Page</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('marks current page with aria-current="page"', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item current>Current</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    expect(screen.getByText('Current').closest('[aria-current="page"]')).toBeInTheDocument();
  });

  it('renders separator between items', () => {
    render(
      <Breadcrumbs separator=">">
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item current>Page</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('renders items as links when href is provided', () => {
    render(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/about">About</Breadcrumbs.Item>
        <Breadcrumbs.Item current>Contact</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');
  });

  it('collapses middle items when maxItems is set', async () => {
    const user = userEvent.setup();
    render(
      <Breadcrumbs maxItems={2}>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/a">A</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/b">B</Breadcrumbs.Item>
        <Breadcrumbs.Item current>C</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    // Middle items should be collapsed with an ellipsis button
    expect(screen.getByRole('button', { name: /show collapsed/i })).toBeInTheDocument();
    expect(screen.queryByText('A')).not.toBeInTheDocument();

    // Expand collapsed items
    await user.click(screen.getByRole('button', { name: /show collapsed/i }));
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Breadcrumbs>
        <Breadcrumbs.Item href="/">Home</Breadcrumbs.Item>
        <Breadcrumbs.Item href="/products">Products</Breadcrumbs.Item>
        <Breadcrumbs.Item current>Widget</Breadcrumbs.Item>
      </Breadcrumbs>
    );
    await expectNoA11yViolations(container);
  });
});
