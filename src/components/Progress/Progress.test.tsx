import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Progress, CircularProgress } from './index';

describe('Progress', () => {
  it('renders a progressbar role', () => {
    render(<Progress value={50} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('sets aria-valuenow, aria-valuemin, and aria-valuemax', () => {
    render(<Progress value={30} min={0} max={100} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '30');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('renders as indeterminate when value is null', () => {
    render(<Progress value={null} />);
    const bar = screen.getByRole('progressbar');
    // indeterminate — no aria-valuenow
    expect(bar).not.toHaveAttribute('aria-valuenow');
  });

  it('renders a label', () => {
    render(<Progress value={40} label="Upload progress" />);
    expect(screen.getByText('Upload progress')).toBeInTheDocument();
  });

  it('shows percentage when showValue is true', () => {
    render(<Progress value={75} showValue />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('applies size class to track', () => {
    const { container } = render(<Progress value={50} size="lg" />);
    const track = container.querySelector('[class*="track"]');
    expect(track?.className).toContain('trackLg');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Progress value={60} label="Loading" />);
    await expectNoA11yViolations(container);
  });
});

describe('CircularProgress', () => {
  it('renders a progressbar role', () => {
    render(<CircularProgress value={50} aria-label="Loading" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CircularProgress value={50} aria-label="Loading" />);
    await expectNoA11yViolations(container);
  });
});
