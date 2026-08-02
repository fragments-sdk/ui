export type ScrollOrientation = 'horizontal' | 'vertical' | 'both';
export type ScrollEdgeState = 'none' | 'start' | 'end' | 'both';
export type RtlScrollModel = 'negative' | 'positive-descending' | 'positive-ascending';

export interface ScrollAxesState {
  x: ScrollEdgeState;
  y: ScrollEdgeState;
}

export const SCROLL_EDGE_EPSILON_PX = 1;

const rtlScrollModels = new WeakMap<Document, RtlScrollModel>();

/** Detect the browser's RTL scrollLeft model without retaining probe elements. */
export function detectRtlScrollModel(document: Document): RtlScrollModel {
  const cachedModel = rtlScrollModels.get(document);
  if (cachedModel) return cachedModel;

  const viewport = document.createElement('div');
  const content = document.createElement('div');
  viewport.dir = 'rtl';
  viewport.style.cssText =
    'position:absolute;inset-block-start:-9999px;inline-size:4px;block-size:1px;overflow:scroll;visibility:hidden';
  content.style.cssText = 'inline-size:8px;block-size:1px';
  viewport.append(content);
  (document.body ?? document.documentElement).append(viewport);

  let model: RtlScrollModel;
  if (viewport.scrollLeft > 0) {
    model = 'positive-descending';
  } else {
    viewport.scrollLeft = 1;
    model = viewport.scrollLeft === 0 ? 'negative' : 'positive-ascending';
  }

  viewport.remove();
  rtlScrollModels.set(document, model);
  return model;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function resolveEdgeState(distanceFromStart: number, maxScroll: number): ScrollEdgeState {
  if (maxScroll <= SCROLL_EDGE_EPSILON_PX) return 'none';
  if (distanceFromStart <= SCROLL_EDGE_EPSILON_PX) return 'end';
  if (maxScroll - distanceFromStart <= SCROLL_EDGE_EPSILON_PX) return 'start';
  return 'both';
}

export function readScrollAxes(
  element: Pick<
    HTMLElement,
    'clientWidth' | 'clientHeight' | 'scrollWidth' | 'scrollHeight' | 'scrollLeft' | 'scrollTop'
  >,
  options: {
    orientation: ScrollOrientation;
    direction: 'ltr' | 'rtl';
    rtlModel?: RtlScrollModel;
  }
): ScrollAxesState {
  const allowX = options.orientation === 'horizontal' || options.orientation === 'both';
  const allowY = options.orientation === 'vertical' || options.orientation === 'both';

  const maxX = Math.max(0, element.scrollWidth - element.clientWidth);
  const maxY = Math.max(0, element.scrollHeight - element.clientHeight);

  let x: ScrollEdgeState = 'none';
  if (allowX) {
    let logicalScrollLeft = element.scrollLeft;
    if (options.direction === 'rtl') {
      const rtlModel = options.rtlModel ?? 'negative';
      if (rtlModel === 'negative') {
        logicalScrollLeft = -element.scrollLeft;
      } else if (rtlModel === 'positive-descending') {
        logicalScrollLeft = maxX - element.scrollLeft;
      }
    }

    x = resolveEdgeState(clamp(logicalScrollLeft, 0, maxX), maxX);
  }

  const y = allowY ? resolveEdgeState(clamp(element.scrollTop, 0, maxY), maxY) : 'none';

  return { x, y };
}
