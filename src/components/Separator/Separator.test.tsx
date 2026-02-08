import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Separator } from './index';

describe('Separator', () => {
  it('renders with role="separator"', () => {
    render(<Separator />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('applies horizontal class by default', () => {
    render(<Separator />);
    expect(screen.getByRole('separator')).toHaveClass('horizontal');
  });

  it('applies vertical class and orientation', () => {
    render(<Separator orientation="vertical" />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveClass('vertical');
  });

  it('renders labeled separator', () => {
    render(<Separator label="OR" />);
    const sep = screen.getByRole('separator');
    expect(sep).toHaveClass('withLabel');
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Separator />);
    await expectNoA11yViolations(container);
  });
});
