import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { VisuallyHidden } from './index';

const visuallyHiddenStyles = readFileSync(
  resolve(process.cwd(), 'src/components/VisuallyHidden/VisuallyHidden.module.scss'),
  'utf8'
);

describe('VisuallyHidden', () => {
  it('renders content that is accessible to screen readers', () => {
    render(<VisuallyHidden>Hidden label</VisuallyHidden>);
    expect(screen.getByText('Hidden label')).toBeInTheDocument();
  });

  it('applies visually hidden class', () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    expect(screen.getByText('Hidden')).toHaveClass('visuallyHidden');
  });

  it('renders as a different element via "as" prop', () => {
    render(<VisuallyHidden as="div">Hidden</VisuallyHidden>);
    expect(screen.getByText('Hidden').tagName).toBe('DIV');
  });

  it('forwards ref', () => {
    const ref = vi.fn();
    render(<VisuallyHidden ref={ref}>Hidden</VisuallyHidden>);
    expect(ref).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<VisuallyHidden>Accessible hidden text</VisuallyHidden>);
    await expectNoA11yViolations(container);
  });

  it('forwards DOM props and composes className', () => {
    render(
      <VisuallyHidden data-testid="vh" id="vh-id" className="extra">
        Hidden
      </VisuallyHidden>
    );
    const el = screen.getByTestId('vh');
    expect(el).toHaveAttribute('id', 'vh-id');
    expect(el).toHaveClass('visuallyHidden');
    expect(el).toHaveClass('extra');
  });

  it('keeps the reviewed accessibility geometry and scoped governance exceptions', () => {
    expect(visuallyHiddenStyles).toContain('width: 1px;');
    expect(visuallyHiddenStyles).toContain('height: 1px;');
    expect(visuallyHiddenStyles).toContain('margin: -1px;');
    expect(visuallyHiddenStyles.match(/fragments-allow FUI2004/g)).toHaveLength(3);
    expect(visuallyHiddenStyles.match(/expires="2027-08-01"/g)).toHaveLength(3);
  });
});
