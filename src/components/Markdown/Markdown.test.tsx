import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Markdown } from './index';

// Markdown resolves react-markdown with a dynamic import, so the first render
// on a page is always the plain-text fallback and the parsed output arrives a
// tick later. The synchronous assertions below therefore describe the fallback;
// the one that awaits describes the real thing.

describe('Markdown', () => {
  it('renders markdown content as paragraphs (fallback)', () => {
    render(<Markdown content="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('splits content into paragraphs on double newlines (fallback)', () => {
    const { container } = render(
      <Markdown content={'First paragraph\n\nSecond paragraph'} />
    );
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent('First paragraph');
    expect(paragraphs[1]).toHaveTextContent('Second paragraph');
  });

  it('applies custom className', () => {
    const { container } = render(<Markdown content="test" className="custom" />);
    expect(container.firstElementChild).toHaveClass('custom');
  });

  it('renders the wrapping div with markdown class', () => {
    const { container } = render(<Markdown content="test" />);
    expect(container.firstElementChild).toHaveClass('markdown');
  });

  it('forwards root DOM props to the wrapper', () => {
    render(<Markdown content="test" id="md-root" data-testid="markdown" />);
    const root = screen.getByTestId('markdown');
    expect(root).toHaveAttribute('id', 'md-root');
  });

  it('renders parsed markdown once the parser resolves', async () => {
    render(<Markdown content={'# Heading\n\nSome **bold** text.'} />);
    // A heading element is something only the real parser can produce — the
    // fallback emits every block as a <p>. This is the regression guard for
    // the require()-in-a-browser-bundle bug, which failed silently by looking
    // exactly like markdown that had not been written as markdown.
    expect(await screen.findByRole('heading', { name: 'Heading' })).toBeInTheDocument();
    expect(await screen.findByText('bold')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Markdown content={'# Hello\n\nSome paragraph text.\n\nAnother paragraph.'} />
    );
    await expectNoA11yViolations(container);
  });
});
