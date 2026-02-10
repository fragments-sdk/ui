import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from '../../test/utils';
import { DatePicker } from './index';
import type { DateRange } from './index';

function renderDatePicker(props: {
  onSelect?: (date: Date | null) => void;
  disabled?: boolean;
  selected?: Date | null;
  placeholder?: string;
} = {}) {
  return render(
    <DatePicker
      placeholder={props.placeholder ?? 'Pick a date'}
      onSelect={props.onSelect}
      disabled={props.disabled}
      selected={props.selected}
    >
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  );
}

function renderRangePicker(props: {
  onRangeSelect?: (range: DateRange | null) => void;
  selectedRange?: DateRange | null;
  numberOfMonths?: number;
  placeholder?: string;
} = {}) {
  return render(
    <DatePicker
      mode="range"
      placeholder={props.placeholder ?? 'Select date range'}
      onRangeSelect={props.onRangeSelect}
      selectedRange={props.selectedRange}
      numberOfMonths={props.numberOfMonths ?? 2}
    >
      <DatePicker.Trigger />
      <DatePicker.Content>
        <DatePicker.Calendar />
      </DatePicker.Content>
    </DatePicker>
  );
}

describe('DatePicker', () => {
  describe('rendering', () => {
    it('renders a trigger button', () => {
      renderDatePicker();
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('shows placeholder text when no value selected', () => {
      renderDatePicker({ placeholder: 'Choose date' });
      expect(screen.getByText('Choose date')).toBeInTheDocument();
    });

    it('shows formatted date when selected', () => {
      renderDatePicker({ selected: new Date(2025, 0, 15) });
      // format(date, 'PPP') produces "January 15th, 2025"
      expect(screen.getByRole('button')).toHaveTextContent('January');
      expect(screen.getByRole('button')).toHaveTextContent('2025');
    });

    it('shows formatted range when range selected', () => {
      const range: DateRange = {
        from: new Date(2025, 0, 10),
        to: new Date(2025, 0, 20),
      };
      renderRangePicker({ selectedRange: range });
      expect(screen.getByRole('button')).toHaveTextContent('Jan 10, 2025');
      expect(screen.getByRole('button')).toHaveTextContent('Jan 20, 2025');
    });
  });

  describe('interaction', () => {
    it('opens on click', async () => {
      const user = userEvent.setup();
      renderDatePicker();

      await user.click(screen.getByRole('button'));
      // DayPicker renders a grid
      expect(await screen.findByRole('grid')).toBeInTheDocument();
    });

    it('selects a date on click', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      renderDatePicker({ onSelect });

      await user.click(screen.getByRole('button'));
      await screen.findByRole('grid');

      // Click the 15th day button (find any visible "15" in a grid cell)
      const dayButtons = screen.getAllByRole('gridcell');
      const day15 = dayButtons.find((cell) => {
        const btn = cell.querySelector('button');
        return btn?.textContent === '15';
      });
      expect(day15).toBeDefined();
      const btn = day15!.querySelector('button')!;
      await user.click(btn);

      expect(onSelect).toHaveBeenCalledWith(expect.any(Date));
    });

    it('auto-closes after single date selection', async () => {
      const user = userEvent.setup();
      renderDatePicker({ onSelect: vi.fn() });

      await user.click(screen.getByRole('button'));
      await screen.findByRole('grid');

      const dayButtons = screen.getAllByRole('gridcell');
      const visibleDay = dayButtons.find((cell) => {
        const btn = cell.querySelector('button');
        return btn?.textContent === '10';
      });
      const btn = visibleDay!.querySelector('button')!;
      await user.click(btn);

      await waitFor(() => {
        expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('range mode: stays open after both clicks (no auto-close)', async () => {
      const user = userEvent.setup();
      const onRangeSelect = vi.fn();
      renderRangePicker({ onRangeSelect, numberOfMonths: 1 });

      await user.click(screen.getByRole('button'));
      await screen.findByRole('grid');

      const dayButtons = screen.getAllByRole('gridcell');
      const day10 = dayButtons.find((cell) => {
        const btn = cell.querySelector('button');
        return btn?.textContent === '10';
      });
      await user.click(day10!.querySelector('button')!);

      // Should still be open after first click
      expect(screen.getByRole('grid')).toBeInTheDocument();

      const day20 = dayButtons.find((cell) => {
        const btn = cell.querySelector('button');
        return btn?.textContent === '20';
      });
      await user.click(day20!.querySelector('button')!);

      // Range mode never auto-closes — user closes via Escape or click-outside
      expect(screen.getByRole('grid')).toBeInTheDocument();
    });

    it('preset click selects a date', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const presetDate = new Date(2025, 5, 1);

      render(
        <DatePicker onSelect={onSelect}>
          <DatePicker.Trigger placeholder="Pick a date" />
          <DatePicker.Content>
            <DatePicker.Preset date={presetDate}>June 1st</DatePicker.Preset>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );

      await user.click(screen.getByRole('button', { name: /pick a date/i }));
      await user.click(await screen.findByText('June 1st'));

      expect(onSelect).toHaveBeenCalledWith(presetDate);
    });
  });

  describe('keyboard', () => {
    it('Escape closes the calendar', async () => {
      const user = userEvent.setup();
      renderDatePicker();

      await user.click(screen.getByRole('button'));
      await screen.findByRole('grid');

      await user.keyboard('{Escape}');
      await waitFor(() => {
        expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      });
    });
  });

  describe('disabled', () => {
    it('trigger is disabled when disabled prop is true', () => {
      renderDatePicker({ disabled: true });
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('controlled', () => {
    it('reflects external selected value', () => {
      const date = new Date(2025, 2, 20);
      renderDatePicker({ selected: date });
      expect(screen.getByRole('button')).toHaveTextContent('March');
      expect(screen.getByRole('button')).toHaveTextContent('2025');
    });

    it('reflects external selectedRange value', () => {
      const range: DateRange = {
        from: new Date(2025, 3, 1),
        to: new Date(2025, 3, 7),
      };
      renderRangePicker({ selectedRange: range });
      expect(screen.getByRole('button')).toHaveTextContent('Apr 01, 2025');
      expect(screen.getByRole('button')).toHaveTextContent('Apr 07, 2025');
    });
  });

  describe('multi-month', () => {
    it('renders correct number of month panels', async () => {
      const user = userEvent.setup();
      renderRangePicker({ numberOfMonths: 2 });

      await user.click(screen.getByRole('button'));
      const grids = await screen.findAllByRole('grid');
      expect(grids).toHaveLength(2);
    });
  });

  describe('a11y', () => {
    it('has no accessibility violations (closed)', async () => {
      const { container } = render(
        <DatePicker>
          <DatePicker.Trigger aria-label="Pick a date" placeholder="Pick a date" />
          <DatePicker.Content>
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );
      await expectNoA11yViolations(container);
    });

    it('has no accessibility violations (open)', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <DatePicker>
          <DatePicker.Trigger aria-label="Pick a date" placeholder="Pick a date" />
          <DatePicker.Content aria-label="Choose date">
            <DatePicker.Calendar />
          </DatePicker.Content>
        </DatePicker>
      );

      await user.click(screen.getByRole('button'));
      await screen.findByRole('grid');
      // Disable aria-command-name: Base UI focus guard spans have role="button" without names (upstream)
      await expectNoA11yViolations(container, {
        disabledRules: ['aria-command-name'],
      });
    });
  });
});
