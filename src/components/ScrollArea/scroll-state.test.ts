import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';
import {
  detectRtlScrollModel,
  readScrollAxes,
  SCROLL_EDGE_EPSILON_PX,
  type RtlScrollModel,
} from './scroll-state';

function metrics(overrides: Partial<HTMLElement> = {}) {
  return {
    clientWidth: 100,
    clientHeight: 100,
    scrollWidth: 300,
    scrollHeight: 300,
    scrollLeft: 0,
    scrollTop: 0,
    ...overrides,
  };
}

describe('readScrollAxes', () => {
  it('returns no edges for content within the one-pixel overflow epsilon', () => {
    expect(
      readScrollAxes(metrics({ scrollWidth: 101, scrollHeight: 101 }), {
        orientation: 'both',
        direction: 'ltr',
      })
    ).toEqual({ x: 'none', y: 'none' });
  });

  it('keeps disallowed axes at none', () => {
    expect(
      readScrollAxes(metrics({ scrollLeft: 100, scrollTop: 100 }), {
        orientation: 'horizontal',
        direction: 'ltr',
      })
    ).toEqual({ x: 'both', y: 'none' });
    expect(
      readScrollAxes(metrics({ scrollLeft: 100, scrollTop: 100 }), {
        orientation: 'vertical',
        direction: 'ltr',
      })
    ).toEqual({ x: 'none', y: 'both' });
  });

  it('resolves vertical start, middle, and end with fractional epsilon boundaries', () => {
    expect(
      readScrollAxes(metrics({ scrollTop: SCROLL_EDGE_EPSILON_PX }), {
        orientation: 'vertical',
        direction: 'ltr',
      }).y
    ).toBe('end');
    expect(
      readScrollAxes(metrics({ scrollTop: 100.25 }), {
        orientation: 'vertical',
        direction: 'ltr',
      }).y
    ).toBe('both');
    expect(
      readScrollAxes(metrics({ scrollTop: 199.25 }), {
        orientation: 'vertical',
        direction: 'ltr',
      }).y
    ).toBe('start');
  });

  it.each([
    ['negative', 0, -100, -200],
    ['positive-descending', 200, 100, 0],
    ['positive-ascending', 0, 100, 200],
  ] as const)(
    'normalizes the %s RTL model into logical start, middle, and end',
    (rtlModel: RtlScrollModel, start, middle, end) => {
      const read = (scrollLeft: number) =>
        readScrollAxes(metrics({ scrollLeft }), {
          orientation: 'horizontal',
          direction: 'rtl',
          rtlModel,
        }).x;

      expect(read(start)).toBe('end');
      expect(read(middle)).toBe('both');
      expect(read(end)).toBe('start');
    }
  );

  it('clamps overscroll before resolving an edge', () => {
    expect(
      readScrollAxes(metrics({ scrollLeft: -20, scrollTop: 250 }), {
        orientation: 'both',
        direction: 'ltr',
      })
    ).toEqual({ x: 'end', y: 'start' });
  });
});

describe('detectRtlScrollModel', () => {
  it('caches the result per document and removes the probe synchronously', () => {
    const before = document.body.childElementCount;
    const first = detectRtlScrollModel(document);
    const second = detectRtlScrollModel(document);

    expect(['negative', 'positive-descending', 'positive-ascending']).toContain(first);
    expect(second).toBe(first);
    expect(document.body.childElementCount).toBe(before);
  });
});

describe('ScrollArea geometry source', () => {
  const styles = readFileSync(
    resolve(process.cwd(), 'src/components/ScrollArea/ScrollArea.module.scss'),
    'utf8'
  );

  it('keeps track geometry stable across visibility states', () => {
    expect(styles).not.toMatch(/scrollbar-width:\s*none/);
    expect(styles).not.toMatch(/(?:width|height):\s*0/);
    expect(styles).not.toContain('scrollbar-gutter');
    expect(styles).toContain("[data-scrollbar-visibility='always']");
  });

  it('intersects independent inline and block masks', () => {
    expect(styles).toContain('mask-composite: intersect');
    expect(styles).toContain('-webkit-mask-composite: source-in');
    expect(styles).toContain(".viewport[data-scroll-x='both']");
    expect(styles).toContain(".viewport[data-scroll-y='both']");
  });

  it('anchors every scroll-state selector to the local viewport class', () => {
    const stateSelectors = styles.match(/^.*\[data-scroll-[xy]='(?:start|both|end)'\].*\{/gm) ?? [];

    expect(stateSelectors).toHaveLength(8);
    expect(stateSelectors.every((selector) => selector.trimStart().startsWith('.viewport'))).toBe(
      true
    );
  });

  it('gives every public custom-property read a fallback', () => {
    expect(styles.match(/var\(--fui-[\w-]+\s*\)/g) ?? []).toEqual([]);
  });
});
