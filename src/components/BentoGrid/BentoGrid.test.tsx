import { describe, it, expect, vi } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { BentoGrid } from './index';

describe('BentoGrid', () => {
  it('renders children', () => {
    render(
      <BentoGrid>
        <BentoGrid.Item>Item 1</BentoGrid.Item>
        <BentoGrid.Item>Item 2</BentoGrid.Item>
      </BentoGrid>
    );
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies default columns3 class', () => {
    const { container } = render(<BentoGrid>Content</BentoGrid>);
    expect(container.firstChild).toHaveClass('columns3');
  });

  it('applies columns2 class', () => {
    const { container } = render(<BentoGrid columns={2}>Content</BentoGrid>);
    expect(container.firstChild).toHaveClass('columns2');
  });

  it('applies columns4 class', () => {
    const { container } = render(<BentoGrid columns={4}>Content</BentoGrid>);
    expect(container.firstChild).toHaveClass('columns4');
  });

  it('applies default gapMd class', () => {
    const { container } = render(<BentoGrid>Content</BentoGrid>);
    expect(container.firstChild).toHaveClass('gapMd');
  });

  it('applies gap classes', () => {
    const { container } = render(<BentoGrid gap="lg">Content</BentoGrid>);
    expect(container.firstChild).toHaveClass('gapLg');
  });

  it('sets CSS custom properties for simple colSpan', () => {
    const { container } = render(
      <BentoGrid>
        <BentoGrid.Item colSpan={2}>Wide</BentoGrid.Item>
      </BentoGrid>
    );
    const item = container.querySelector('[class*="item"]') as HTMLElement;
    expect(item.style.getPropertyValue('--bento-col-span')).toBe('2');
  });

  it('sets CSS custom properties for simple rowSpan', () => {
    const { container } = render(
      <BentoGrid>
        <BentoGrid.Item rowSpan={2}>Tall</BentoGrid.Item>
      </BentoGrid>
    );
    const item = container.querySelector('[class*="item"]') as HTMLElement;
    expect(item.style.getPropertyValue('--bento-row-span')).toBe('2');
  });

  it('sets per-breakpoint CSS custom properties for responsive colSpan', () => {
    const { container } = render(
      <BentoGrid>
        <BentoGrid.Item colSpan={{ base: 1, lg: 2 }}>Responsive</BentoGrid.Item>
      </BentoGrid>
    );
    const item = container.querySelector('[class*="item"]') as HTMLElement;
    // base=1 should not set --bento-col-span (only values > 1)
    expect(item.style.getPropertyValue('--bento-col-span')).toBe('');
    expect(item.style.getPropertyValue('--bento-col-span-lg')).toBe('2');
  });

  it('sets per-breakpoint CSS custom properties for responsive rowSpan', () => {
    const { container } = render(
      <BentoGrid>
        <BentoGrid.Item rowSpan={{ base: 1, md: 2, xl: 3 }}>Responsive</BentoGrid.Item>
      </BentoGrid>
    );
    const item = container.querySelector('[class*="item"]') as HTMLElement;
    expect(item.style.getPropertyValue('--bento-row-span')).toBe('');
    expect(item.style.getPropertyValue('--bento-row-span-md')).toBe('2');
    expect(item.style.getPropertyValue('--bento-row-span-xl')).toBe('3');
  });

  it('does not set vars for default span value (1)', () => {
    const { container } = render(
      <BentoGrid>
        <BentoGrid.Item colSpan={1} rowSpan={1}>Default</BentoGrid.Item>
      </BentoGrid>
    );
    const item = container.querySelector('[class*="item"]') as HTMLElement;
    expect(item.style.getPropertyValue('--bento-col-span')).toBe('');
    expect(item.style.getPropertyValue('--bento-row-span')).toBe('');
  });

  it('forwards ref on root', () => {
    const ref = vi.fn();
    render(<BentoGrid ref={ref}>Content</BentoGrid>);
    expect(ref).toHaveBeenCalled();
  });

  it('forwards ref on item', () => {
    const ref = vi.fn();
    render(
      <BentoGrid>
        <BentoGrid.Item ref={ref}>Content</BentoGrid.Item>
      </BentoGrid>
    );
    expect(ref).toHaveBeenCalled();
  });

  it('accepts className on root', () => {
    const { container } = render(<BentoGrid className="custom-root">Content</BentoGrid>);
    expect(container.firstChild).toHaveClass('custom-root');
  });

  it('accepts className on item', () => {
    const { container } = render(
      <BentoGrid>
        <BentoGrid.Item className="custom-item">Content</BentoGrid.Item>
      </BentoGrid>
    );
    const item = container.querySelector('.custom-item');
    expect(item).toBeInTheDocument();
  });

  it('forwards DOM props on root and item and merges item style with span vars', () => {
    const { container } = render(
      <BentoGrid data-testid="grid" aria-label="Bento grid">
        <BentoGrid.Item
          data-testid="item"
          colSpan={2}
          style={{ backgroundColor: 'rgb(1, 2, 3)' }}
        >
          Content
        </BentoGrid.Item>
      </BentoGrid>
    );

    expect(screen.getByTestId('grid')).toHaveAttribute('aria-label', 'Bento grid');
    const item = screen.getByTestId('item');
    expect(item).toHaveStyle({ backgroundColor: 'rgb(1, 2, 3)' });
    expect(item.style.getPropertyValue('--bento-col-span')).toBe('2');
    expect(container.querySelector('[data-testid="item"]')).toBe(item);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <BentoGrid columns={3}>
        <BentoGrid.Item colSpan={2} rowSpan={2}>Hero</BentoGrid.Item>
        <BentoGrid.Item>Item 2</BentoGrid.Item>
        <BentoGrid.Item>Item 3</BentoGrid.Item>
        <BentoGrid.Item>Item 4</BentoGrid.Item>
        <BentoGrid.Item>Item 5</BentoGrid.Item>
      </BentoGrid>
    );
    await expectNoA11yViolations(container);
  });
});
