import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Markdown } from './index';

// The Markdown component uses require() to load react-markdown lazily.
// In test env, react-markdown may not be installed, so it will use the fallback renderer.
// We test the fallback behavior which renders paragraphs from plain text.

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

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Markdown content={'# Hello\n\nSome paragraph text.\n\nAnother paragraph.'} />
    );
    await expectNoA11yViolations(container);
  });
});
