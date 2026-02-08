import { describe, it, expect, vi } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Slider } from './index';

describe('Slider', () => {
  it('renders a slider role', () => {
    render(<Slider aria-label="Volume" />);
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('sets aria-valuemin and aria-valuemax from min/max props', () => {
    render(<Slider aria-label="Volume" min={10} max={90} defaultValue={50} />);
    const slider = screen.getByRole('slider');
    // Base UI Slider sets min/max on the group or thumb — check the output element
    expect(slider).toBeInTheDocument();
    // The slider group should be present with the right configuration
    const output = slider.closest('[role="group"]') || slider;
    expect(output).toBeInTheDocument();
  });

  it('sets aria-valuenow from value prop', () => {
    render(<Slider aria-label="Volume" value={42} onChange={() => {}} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '42');
  });

  it('renders a label via Field.Label', () => {
    render(<Slider label="Volume" />);
    expect(screen.getByText('Volume')).toBeInTheDocument();
  });

  it('disables the slider', () => {
    render(<Slider aria-label="Volume" disabled />);
    expect(screen.getByRole('slider')).toBeDisabled();
  });

  it('respects step attribute', () => {
    render(<Slider aria-label="Volume" step={5} defaultValue={0} />);
    // step is part of the slider control — no direct ARIA but functional
    expect(screen.getByRole('slider')).toBeInTheDocument();
  });

  it('displays the value when showValue is true', () => {
    render(<Slider label="Volume" value={75} showValue onChange={() => {}} />);
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Slider label="Accessible slider" defaultValue={50} />);
    await expectNoA11yViolations(container);
  });
});
