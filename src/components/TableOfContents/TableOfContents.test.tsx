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
    expect(screen.getByRole('link', { name: 'Setup' })).toHaveAttribute('aria-current', 'true');
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

  it('renders items in a list', () => {
    render(
      <TableOfContents>
        <TableOfContents.Item id="a">A</TableOfContents.Item>
        <TableOfContents.Item id="b">B</TableOfContents.Item>
        <TableOfContents.Item id="c">C</TableOfContents.Item>
      </TableOfContents>
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('passes additional className to root', () => {
    const { container } = render(
      <TableOfContents className="custom-class">
        <TableOfContents.Item id="a">A</TableOfContents.Item>
      </TableOfContents>
    );
    expect(container.querySelector('.custom-class')).toBeInTheDocument();
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
});
