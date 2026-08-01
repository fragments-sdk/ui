import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ScrollArea } from '.';

type FrameCallback = (time: number) => void;

let nextFrameId = 0;
let frameCallbacks: Map<number, FrameCallback>;
let resizeObservers: FakeResizeObserver[];
let mutationObservers: FakeMutationObserver[];

class FakeResizeObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  constructor(readonly callback: ResizeObserverCallback) {
    resizeObservers.push(this);
  }
}

class FakeMutationObserver {
  readonly observe = vi.fn();
  readonly disconnect = vi.fn();
  constructor(readonly callback: MutationCallback) {
    mutationObservers.push(this);
  }
}

function viewport(container: HTMLElement): HTMLDivElement {
  const element = container.querySelector('[data-scroll-x]');
  if (!(element instanceof HTMLDivElement)) throw new Error('ScrollArea viewport was not found');
  return element;
}

function setMetrics(
  element: HTMLElement,
  values: Partial<
    Record<
      'clientWidth' | 'clientHeight' | 'scrollWidth' | 'scrollHeight' | 'scrollLeft' | 'scrollTop',
      number
    >
  >
) {
  Object.entries(values).forEach(([property, value]) => {
    Object.defineProperty(element, property, { configurable: true, value, writable: true });
  });
}

function flushFrame() {
  const pendingCallbacks = Array.from(frameCallbacks.values());
  frameCallbacks.clear();
  act(() => pendingCallbacks.forEach((callback) => callback(0)));
}

beforeEach(() => {
  nextFrameId = 0;
  frameCallbacks = new Map();
  resizeObservers = [];
  mutationObservers = [];
  vi.stubGlobal('requestAnimationFrame', (callback: FrameCallback) => {
    nextFrameId += 1;
    frameCallbacks.set(nextFrameId, callback);
    return nextFrameId;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frameCallbacks.delete(id));
  vi.stubGlobal('ResizeObserver', FakeResizeObserver);
  vi.stubGlobal('MutationObserver', FakeMutationObserver);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ScrollArea', () => {
  it('renders children and preserves root attributes', () => {
    const { container } = render(
      <ScrollArea orientation="horizontal" className="custom-class" data-testid="scroll-area">
        Test content
      </ScrollArea>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByTestId('scroll-area')).toHaveClass('custom-class');
    expect(container.firstChild).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('defaults to vertical with inert state attributes and no observers', () => {
    const { container } = render(<ScrollArea>Content</ScrollArea>);

    expect(container.firstChild).toHaveAttribute('data-orientation', 'vertical');
    expect(viewport(container)).toHaveAttribute('data-scroll-x', 'none');
    expect(viewport(container)).toHaveAttribute('data-scroll-y', 'none');
    expect(resizeObservers).toHaveLength(0);
    expect(mutationObservers).toHaveLength(0);
    expect(frameCallbacks.size).toBe(0);
  });

  it('reads both axes independently on the scheduled layout frame', () => {
    const { container } = render(
      <ScrollArea orientation="both" showFades>
        <div>Wide and tall content</div>
      </ScrollArea>
    );
    const element = viewport(container);
    setMetrics(element, {
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 300,
      scrollHeight: 300,
      scrollLeft: 0,
      scrollTop: 100,
    });

    flushFrame();

    expect(element).toHaveAttribute('data-scroll-x', 'end');
    expect(element).toHaveAttribute('data-scroll-y', 'both');
  });

  it('coalesces scroll and resize notifications into one frame', () => {
    const { container } = render(<ScrollArea showFades>Content</ScrollArea>);
    const element = viewport(container);
    flushFrame();

    act(() => {
      element.dispatchEvent(new Event('scroll'));
      element.dispatchEvent(new Event('scroll'));
      resizeObservers[0].callback([], resizeObservers[0] as unknown as ResizeObserver);
    });

    expect(frameCallbacks.size).toBe(1);
    flushFrame();
    expect(frameCallbacks.size).toBe(0);
  });

  it('resubscribes direct children after nested mutations', () => {
    const { container, rerender } = render(
      <ScrollArea showFades>
        <div key="first" data-testid="first-child">
          First
        </div>
      </ScrollArea>
    );
    flushFrame();
    const resizeObserver = resizeObservers[0];
    const firstChild = screen.getByTestId('first-child');

    rerender(
      <ScrollArea showFades>
        <div key="second" data-testid="second-child">
          Second
        </div>
      </ScrollArea>
    );
    act(() => {
      mutationObservers[0].callback([], mutationObservers[0] as unknown as MutationObserver);
    });

    expect(resizeObserver.unobserve).toHaveBeenCalledWith(firstChild);
    expect(resizeObserver.observe).toHaveBeenCalledWith(screen.getByTestId('second-child'));
    expect(frameCallbacks.size).toBe(1);
    expect(viewport(container)).toBeInTheDocument();
  });

  it('forwards direction and schedules a fresh read when orientation changes', () => {
    const { container, rerender } = render(
      <ScrollArea orientation="horizontal" dir="rtl" showFades>
        Content
      </ScrollArea>
    );
    expect(container.firstChild).toHaveAttribute('dir', 'rtl');
    flushFrame();

    rerender(
      <ScrollArea orientation="vertical" dir="rtl" showFades>
        Content
      </ScrollArea>
    );

    expect(frameCallbacks.size).toBe(1);
    expect(resizeObservers[0].disconnect).toHaveBeenCalledOnce();
    expect(mutationObservers[0].disconnect).toHaveBeenCalledOnce();
  });

  it('cancels queued work and disconnects observers on cleanup', () => {
    const { unmount } = render(<ScrollArea showFades>Content</ScrollArea>);
    const resizeObserver = resizeObservers[0];
    const mutationObserver = mutationObservers[0];
    expect(frameCallbacks.size).toBe(1);

    unmount();

    expect(frameCallbacks.size).toBe(0);
    expect(resizeObserver.disconnect).toHaveBeenCalledOnce();
    expect(mutationObserver.disconnect).toHaveBeenCalledOnce();
  });
});
