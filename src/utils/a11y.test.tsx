import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../test/utils';
import { handleArrowNavigation, VisuallyHidden } from './a11y';

describe('handleArrowNavigation', () => {
  const items = ['a', 'b', 'c'];

  function makeEvent(key: string): React.KeyboardEvent {
    return { key, preventDefault: () => {} } as unknown as React.KeyboardEvent;
  }

  it('moves down with ArrowDown in vertical orientation', () => {
    expect(handleArrowNavigation(makeEvent('ArrowDown'), items, 0, { orientation: 'vertical' })).toBe(1);
  });

  it('moves up with ArrowUp in vertical orientation', () => {
    expect(handleArrowNavigation(makeEvent('ArrowUp'), items, 1, { orientation: 'vertical' })).toBe(0);
  });

  it('ignores ArrowDown in horizontal orientation', () => {
    expect(handleArrowNavigation(makeEvent('ArrowDown'), items, 0, { orientation: 'horizontal' })).toBeUndefined();
  });

  it('moves right with ArrowRight in horizontal orientation', () => {
    expect(handleArrowNavigation(makeEvent('ArrowRight'), items, 0, { orientation: 'horizontal' })).toBe(1);
  });

  it('loops from last to first when loop is enabled', () => {
    expect(handleArrowNavigation(makeEvent('ArrowDown'), items, 2, { orientation: 'vertical', loop: true })).toBe(0);
  });

  it('clamps at boundary when loop is disabled', () => {
    expect(handleArrowNavigation(makeEvent('ArrowDown'), items, 2, { orientation: 'vertical', loop: false })).toBe(2);
  });

  it('navigates to first item on Home', () => {
    expect(handleArrowNavigation(makeEvent('Home'), items, 2)).toBe(0);
  });

  it('navigates to last item on End', () => {
    expect(handleArrowNavigation(makeEvent('End'), items, 0)).toBe(2);
  });

  it('handles both orientation (vertical + horizontal keys)', () => {
    expect(handleArrowNavigation(makeEvent('ArrowDown'), items, 0, { orientation: 'both' })).toBe(1);
    expect(handleArrowNavigation(makeEvent('ArrowRight'), items, 0, { orientation: 'both' })).toBe(1);
  });

  it('returns undefined for unrelated keys', () => {
    expect(handleArrowNavigation(makeEvent('Enter'), items, 0)).toBeUndefined();
  });
});

describe('VisuallyHidden (utils)', () => {
  it('hides content visually with inline styles', () => {
    render(<VisuallyHidden>SR only</VisuallyHidden>);
    const el = screen.getByText('SR only');
    expect(el.style.position).toBe('absolute');
    expect(el.style.width).toBe('1px');
    expect(el.style.height).toBe('1px');
    expect(el.style.overflow).toBe('hidden');
  });

  it('does not apply hidden styles when focusable', () => {
    render(<VisuallyHidden focusable>Skip link</VisuallyHidden>);
    const el = screen.getByText('Skip link');
    expect(el.style.position).not.toBe('absolute');
  });

  it('sets data-visually-hidden attribute when not focusable', () => {
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    expect(screen.getByText('Hidden')).toHaveAttribute('data-visually-hidden', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<VisuallyHidden>Accessible</VisuallyHidden>);
    await expectNoA11yViolations(container);
  });
});
