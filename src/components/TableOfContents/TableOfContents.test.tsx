import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { TableOfContents } from './index';

describe('TableOfContents', () => {
  it('renders a nav landmark with default aria-label', () => {
    render(
      <TableOfContents>
        <TableOfContents.Item id="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByRole('navigation', { name: 'Table of contents' })).toBeInTheDocument();
  });

  it('renders the default "On This Page" title', () => {
    render(
      <TableOfContents>
        <TableOfContents.Item id="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByText('On This Page')).toBeInTheDocument();
  });

  it('renders a custom title', () => {
    render(
      <TableOfContents title="Contents">
        <TableOfContents.Item id="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByText('Contents')).toBeInTheDocument();
    expect(screen.queryByText('On This Page')).not.toBeInTheDocument();
  });

  it('hides the title when hideTitle is true', () => {
    render(
      <TableOfContents hideTitle>
        <TableOfContents.Item id="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.queryByText('On This Page')).not.toBeInTheDocument();
  });

  it('renders a custom aria-label', () => {
    render(
      <TableOfContents label="Page sections">
        <TableOfContents.Item id="intro">Intro</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByRole('navigation', { name: 'Page sections' })).toBeInTheDocument();
  });

  it('renders items as links with correct href', () => {
    render(
      <TableOfContents>
        <TableOfContents.Item id="setup">Setup</TableOfContents.Item>
        <TableOfContents.Item id="props">Props</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByRole('link', { name: 'Setup' })).toHaveAttribute('href', '#setup');
    expect(screen.getByRole('link', { name: 'Props' })).toHaveAttribute('href', '#props');
  });

  it('marks active item with aria-current', () => {
    render(
      <TableOfContents>
        <TableOfContents.Item id="setup" active>Setup</TableOfContents.Item>
        <TableOfContents.Item id="props">Props</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByRole('link', { name: 'Setup' })).toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: 'Props' })).not.toHaveAttribute('aria-current');
  });

  it('scrolls to heading on click', async () => {
    const scrollIntoViewMock = vi.fn();
    const heading = document.createElement('h2');
    heading.id = 'setup';
    heading.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(heading);

    const user = userEvent.setup();
    render(
      <TableOfContents>
        <TableOfContents.Item id="setup">Setup</TableOfContents.Item>
      </TableOfContents>
    );

    await user.click(screen.getByRole('link', { name: 'Setup' }));
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth' });

    document.body.removeChild(heading);
  });

  it('allows item onClick to prevent smooth-scroll behavior', async () => {
    const scrollIntoViewMock = vi.fn();
    const heading = document.createElement('h2');
    heading.id = 'setup';
    heading.scrollIntoView = scrollIntoViewMock;
    document.body.appendChild(heading);

    const user = userEvent.setup();
    render(
      <TableOfContents>
        <TableOfContents.Item id="setup" onClick={(e) => e.preventDefault()}>
          Setup
        </TableOfContents.Item>
      </TableOfContents>
    );

    await user.click(screen.getByRole('link', { name: 'Setup' }));
    expect(scrollIntoViewMock).not.toHaveBeenCalled();

    document.body.removeChild(heading);
  });

  it('forwards root DOM props and preserves merged className', () => {
    const { container } = render(
      <TableOfContents id="toc" data-testid="toc" className="custom-class">
        <TableOfContents.Item id="a">A</TableOfContents.Item>
      </TableOfContents>
    );
    const nav = screen.getByRole('navigation', { name: 'Table of contents' });
    expect(nav).toHaveAttribute('id', 'toc');
    expect(nav).toHaveAttribute('data-testid', 'toc');
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });

  it('renders items in a list', () => {
    render(
      <TableOfContents>
        <TableOfContents.Item id="a">A</TableOfContents.Item>
        <TableOfContents.Item id="b">B</TableOfContents.Item>
        <TableOfContents.Item id="c">C</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getAllByRole('list')).toHaveLength(1);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('marks top-level items with data-depth=0 and indented items with data-depth=1', () => {
    render(
      <TableOfContents>
        <TableOfContents.Item id="a">A</TableOfContents.Item>
        <TableOfContents.Item id="b" indent>B</TableOfContents.Item>
      </TableOfContents>
    );
    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('data-depth', '0');
    expect(items[1]).toHaveAttribute('data-depth', '1');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TableOfContents>
        <TableOfContents.Item id="intro">Introduction</TableOfContents.Item>
        <TableOfContents.Item id="setup" active>Setup</TableOfContents.Item>
        <TableOfContents.Item id="api" indent>API Reference</TableOfContents.Item>
        <TableOfContents.Item id="examples">Examples</TableOfContents.Item>
      </TableOfContents>
    );
    await expectNoA11yViolations(container);
  });

  describe('Group', () => {
    it('renders the group label and nested items', () => {
      render(
        <TableOfContents hideTitle>
          <TableOfContents.Item id="overview">Overview</TableOfContents.Item>
          <TableOfContents.Group label="Primitives">
            <TableOfContents.Item id="button">Button</TableOfContents.Item>
            <TableOfContents.Item id="card">Card</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.getByRole('button', { name: /primitives/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Button' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Card' })).toBeInTheDocument();
    });

    it('starts open by default and toggles closed on click', async () => {
      const user = userEvent.setup();
      render(
        <TableOfContents hideTitle>
          <TableOfContents.Group label="Custom">
            <TableOfContents.Item id="features">Features</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      const trigger = screen.getByRole('button', { name: /custom/i });
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument();

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('link', { name: 'Features' })).not.toBeInTheDocument();
    });

    it('respects defaultOpen=false', () => {
      render(
        <TableOfContents hideTitle>
          <TableOfContents.Group label="Custom" defaultOpen={false}>
            <TableOfContents.Item id="features">Features</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.getByRole('button', { name: /custom/i })).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('link', { name: 'Features' })).not.toBeInTheDocument();
    });

    it('supports controlled open + onOpenChange', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      render(
        <TableOfContents hideTitle>
          <TableOfContents.Group label="Custom" open={true} onOpenChange={onOpenChange}>
            <TableOfContents.Item id="features">Features</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      await user.click(screen.getByRole('button', { name: /custom/i }));
      expect(onOpenChange).toHaveBeenCalledWith(false);
      // Stays open because controlled
      expect(screen.getByRole('button', { name: /custom/i })).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('link', { name: 'Features' })).toBeInTheDocument();
    });

    it('renders a non-interactive header when collapsible=false', () => {
      render(
        <TableOfContents hideTitle>
          <TableOfContents.Group label="Always Open" collapsible={false}>
            <TableOfContents.Item id="x">X</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.queryByRole('button', { name: /always open/i })).not.toBeInTheDocument();
      expect(screen.getByText('Always Open')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'X' })).toBeInTheDocument();
    });

    it('inherits depth=1 for nested items inside a Group', () => {
      render(
        <TableOfContents hideTitle>
          <TableOfContents.Group label="Primitives">
            <TableOfContents.Item id="button">Button</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      const nestedItem = screen.getByRole('link', { name: 'Button' }).closest('li');
      expect(nestedItem).toHaveAttribute('data-depth', '1');
    });

    it('renders trailing content (e.g., a count) on the group header', () => {
      render(
        <TableOfContents hideTitle>
          <TableOfContents.Group label="Custom" trailing={<span data-testid="count">140</span>}>
            <TableOfContents.Item id="x">X</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      expect(screen.getByTestId('count')).toHaveTextContent('140');
    });

    it('has no accessibility violations with nested groups', async () => {
      const { container } = render(
        <TableOfContents>
          <TableOfContents.Item id="all" active>All</TableOfContents.Item>
          <TableOfContents.Group label="Primitives">
            <TableOfContents.Item id="button">Button</TableOfContents.Item>
            <TableOfContents.Item id="card">Card</TableOfContents.Item>
          </TableOfContents.Group>
          <TableOfContents.Group label="Custom" defaultOpen={false}>
            <TableOfContents.Item id="features">Features</TableOfContents.Item>
          </TableOfContents.Group>
        </TableOfContents>
      );
      await expectNoA11yViolations(container);
    });
  });
});
