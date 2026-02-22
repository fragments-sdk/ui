import { describe, it, expect } from 'vitest';
import { render, expectNoA11yViolations } from '../../test/utils';
import { Skeleton } from './index';

describe('Skeleton', () => {
  it('renders with aria-hidden="true"', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies variant classes', () => {
    const { container: c1 } = render(<Skeleton variant="text" />);
    expect(c1.firstElementChild).toHaveClass('text');

    const { container: c2 } = render(<Skeleton variant="avatar" />);
    expect(c2.firstElementChild).toHaveClass('avatar');

    const { container: c3 } = render(<Skeleton variant="button" />);
    expect(c3.firstElementChild).toHaveClass('button');
  });

  it('applies static class when animation is disabled', () => {
    const { container } = render(<Skeleton static />);
    expect(container.firstElementChild).toHaveClass('static');
  });

  it('applies custom dimensions via style', () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.width).toBe('200px');
    expect(el.style.height).toBe('100px');
  });

  it('applies fill class', () => {
    const { container } = render(<Skeleton fill />);
    expect(container.firstElementChild).toHaveClass('fill');
  });

  it('renders Skeleton.Text with multiple lines', () => {
    const { container } = render(<Skeleton.Text lines={4} />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    const lines = container.querySelectorAll('.textLine');
    expect(lines).toHaveLength(4);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Skeleton variant="text" />
        <Skeleton variant="avatar" />
        <Skeleton.Text lines={3} />
      </div>
    );
    await expectNoA11yViolations(container);
  });

  it('forwards DOM props on Skeleton and Skeleton.Text', () => {
    const { container } = render(
      <div>
        <Skeleton data-testid="sk" id="skeleton-root" />
        <Skeleton.Text data-testid="sk-text" id="skeleton-text" lines={2} />
      </div>
    );

    expect(container.querySelector('#skeleton-root')).toHaveAttribute('data-testid', 'sk');
    expect(container.querySelector('#skeleton-text')).toHaveAttribute('data-testid', 'sk-text');
  });
});
