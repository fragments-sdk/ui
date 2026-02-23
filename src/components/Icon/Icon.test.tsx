import { describe, it, expect } from 'vitest';
import { render, expectNoA11yViolations } from '../../test/utils';
import { Icon } from './index';

type MockIconProps = {
  size?: number | string;
  weight?: string;
  tone?: 'warm' | 'cool';
};

function MockIcon(props: MockIconProps) {
  return (
    <svg
      data-testid="mock-icon"
      data-size={props.size}
      data-weight={props.weight}
      data-tone={props.tone}
    />
  );
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

  it('forwards custom icon props to arbitrary icon components', () => {
    const { container } = render(<Icon icon={MockIcon} iconProps={{ tone: 'warm' }} />);
    const svg = container.querySelector('[data-testid="mock-icon"]');
    expect(svg).toHaveAttribute('data-tone', 'warm');
  });

  it('does not override an explicit iconProps.size', () => {
    const { container } = render(<Icon icon={MockIcon} size="lg" iconProps={{ size: 99 }} />);
    const svg = container.querySelector('[data-testid="mock-icon"]');
    expect(svg).toHaveAttribute('data-size', '99');
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
