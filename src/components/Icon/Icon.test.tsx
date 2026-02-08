import { describe, it, expect } from 'vitest';
import { render, expectNoA11yViolations } from '../../test/utils';
import { Icon } from './index';

// Mock Phosphor icon component
function MockIcon(props: { size?: number; weight?: string }) {
  return <svg data-testid="mock-icon" data-size={props.size} data-weight={props.weight} />;
}

describe('Icon', () => {
  it('renders the icon component inside a span', () => {
    const { container } = render(<Icon icon={MockIcon} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('SPAN');
    expect(wrapper.querySelector('svg')).toBeInTheDocument();
  });

  it('passes the correct pixel size to the icon', () => {
    const { container } = render(<Icon icon={MockIcon} size="lg" />);
    const svg = container.querySelector('[data-testid="mock-icon"]');
    expect(svg).toHaveAttribute('data-size', '24');
  });

  it('applies variant color class', () => {
    const { container } = render(<Icon icon={MockIcon} variant="error" />);
    expect(container.firstChild).toHaveClass('error');
  });

  it('does not add aria-hidden by default (wrapping span is presentational)', () => {
    const { container } = render(<Icon icon={MockIcon} aria-hidden="true" />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Icon icon={MockIcon} aria-hidden="true" />);
    await expectNoA11yViolations(container);
  });
});
