import { describe, it, expect, vi } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Box } from './index';

describe('Box', () => {
  it('renders a div by default', () => {
    render(<Box>Content</Box>);
    const el = screen.getByText('Content');
    expect(el.tagName).toBe('DIV');
  });

  it('renders as a different element via "as" prop', () => {
    render(<Box as="section">Content</Box>);
    const el = screen.getByText('Content');
    expect(el.tagName).toBe('SECTION');
  });

  it('forwards className and ref', () => {
    const ref = vi.fn();
    const { container } = render(<Box ref={ref} className="custom">Content</Box>);
    expect(ref).toHaveBeenCalled();
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies padding and background classes', () => {
    const { container } = render(<Box padding="lg" background="elevated">Content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass('p-lg');
    expect(el).toHaveClass('bg-elevated');
  });

  it('sets width/height as inline styles', () => {
    const { container } = render(<Box width={300} height="50%">Content</Box>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe('300px');
    expect(el.style.height).toBe('50%');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Box>Accessible</Box>);
    await expectNoA11yViolations(container);
  });

  it('forwards DOM props and event handlers', () => {
    const onClick = vi.fn();
    render(
      <Box data-testid="box" id="box-id" aria-label="Box label" onClick={onClick}>
        Content
      </Box>
    );
    const el = screen.getByTestId('box');
    el.click();
    expect(el).toHaveAttribute('id', 'box-id');
    expect(el).toHaveAttribute('aria-label', 'Box label');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
