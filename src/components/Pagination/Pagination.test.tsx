import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Pagination } from './index';

function renderPagination(props: Partial<React.ComponentProps<typeof Pagination>> = {}) {
  return render(
    <Pagination totalPages={10} defaultPage={1} {...props}>
      <Pagination.Previous />
      <Pagination.Items />
      <Pagination.Next />
    </Pagination>
  );
}

describe('Pagination', () => {
  it('renders correct page range', () => {
    renderPagination({ totalPages: 5 });

    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 3')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 4')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 5')).toBeInTheDocument();
  });

  it('current page is highlighted', () => {
    renderPagination({ defaultPage: 3, totalPages: 5 });

    const page3 = screen.getByLabelText('Go to page 3');
    expect(page3).toHaveAttribute('aria-current', 'page');
  });

  it('click page changes selection', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderPagination({ totalPages: 5, onPageChange });

    await user.click(screen.getByLabelText('Go to page 3'));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('Previous/Next buttons work', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    renderPagination({ totalPages: 5, defaultPage: 3, onPageChange });

    await user.click(screen.getByLabelText('Go to previous page'));
    expect(onPageChange).toHaveBeenCalledWith(2);

    await user.click(screen.getByLabelText('Go to next page'));
    // After clicking prev (now on 2), clicking next goes to 3
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('Previous disabled on page 1', () => {
    renderPagination({ defaultPage: 1, totalPages: 5 });

    expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
  });

  it('Next disabled on last page', () => {
    renderPagination({ defaultPage: 5, totalPages: 5 });

    expect(screen.getByLabelText('Go to next page')).toBeDisabled();
  });

  it('ellipsis renders for large ranges', () => {
    renderPagination({ totalPages: 20, defaultPage: 10 });

    const ellipses = document.querySelectorAll('[aria-hidden="true"]');
    // Should have at least one ellipsis (excluding SVG icons)
    const textEllipses = Array.from(ellipses).filter(
      (el) => el.tagName !== 'svg' && el.textContent === '\u2026'
    );
    expect(textEllipses.length).toBeGreaterThan(0);
  });

  it('edge count customization', () => {
    renderPagination({ totalPages: 20, defaultPage: 10, edgeCount: 2 });

    // With edgeCount=2, pages 1,2 and 19,20 should show
    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 19')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 20')).toBeInTheDocument();
  });

  it('sibling count customization', () => {
    renderPagination({ totalPages: 20, defaultPage: 10, siblingCount: 2 });

    // With siblingCount=2, pages 8,9,10,11,12 should show
    expect(screen.getByLabelText('Go to page 8')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 9')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 10')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 11')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to page 12')).toBeInTheDocument();
  });

  it('controlled mode (page prop)', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();
    const { rerender } = render(
      <Pagination totalPages={5} page={3} onPageChange={onPageChange}>
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
    );

    expect(screen.getByLabelText('Go to page 3')).toHaveAttribute('aria-current', 'page');

    await user.click(screen.getByLabelText('Go to page 5'));
    expect(onPageChange).toHaveBeenCalledWith(5);

    // Re-render with updated page prop
    rerender(
      <Pagination totalPages={5} page={5} onPageChange={onPageChange}>
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
    );

    expect(screen.getByLabelText('Go to page 5')).toHaveAttribute('aria-current', 'page');
  });

  it('keyboard navigation (Tab between buttons)', async () => {
    const user = userEvent.setup();
    renderPagination({ totalPages: 3 });

    const prevButton = screen.getByLabelText('Go to previous page');
    prevButton.focus();

    await user.tab();
    // Focus should move to a page button
    expect(document.activeElement?.getAttribute('aria-label')).toMatch(/Go to page/);
  });

  it('totalPages=0 renders empty nav', () => {
    const { container } = renderPagination({ totalPages: 0 });

    expect(container.querySelector('nav')).toBeInTheDocument();
    expect(container.querySelector('ul')).not.toBeInTheDocument();
  });

  it('totalPages=1 renders single page, no prev/next disabled correctly', () => {
    renderPagination({ totalPages: 1 });

    expect(screen.getByLabelText('Go to page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Go to previous page')).toBeDisabled();
    expect(screen.getByLabelText('Go to next page')).toBeDisabled();
  });

  it('out-of-range controlled page clamps to valid range', () => {
    render(
      <Pagination totalPages={5} page={99}>
        <Pagination.Previous />
        <Pagination.Items />
        <Pagination.Next />
      </Pagination>
    );

    expect(screen.getByLabelText('Go to page 5')).toHaveAttribute('aria-current', 'page');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderPagination({ totalPages: 10, defaultPage: 5 });

    await expectNoA11yViolations(container);
  });
});
