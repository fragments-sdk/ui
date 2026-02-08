import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Listbox } from './index';

describe('Listbox', () => {
  it('renders with listbox role', () => {
    render(
      <Listbox aria-label="Fruits">
        <Listbox.Item>Apple</Listbox.Item>
        <Listbox.Item>Banana</Listbox.Item>
      </Listbox>
    );
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('renders items with option role', () => {
    render(
      <Listbox aria-label="Fruits">
        <Listbox.Item>Apple</Listbox.Item>
        <Listbox.Item>Banana</Listbox.Item>
      </Listbox>
    );
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Apple');
  });

  it('reflects selected state with aria-selected', () => {
    render(
      <Listbox aria-label="Fruits">
        <Listbox.Item selected>Apple</Listbox.Item>
        <Listbox.Item>Banana</Listbox.Item>
      </Listbox>
    );
    expect(screen.getByText('Apple').closest('[role="option"]')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Banana').closest('[role="option"]')).toHaveAttribute('aria-selected', 'false');
  });

  it('marks disabled items with aria-disabled', () => {
    render(
      <Listbox aria-label="Fruits">
        <Listbox.Item disabled>Apple</Listbox.Item>
        <Listbox.Item>Banana</Listbox.Item>
      </Listbox>
    );
    expect(screen.getByText('Apple').closest('[role="option"]')).toHaveAttribute('aria-disabled', 'true');
  });

  it('calls onClick when an item is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Listbox aria-label="Fruits">
        <Listbox.Item onClick={handleClick}>Apple</Listbox.Item>
      </Listbox>
    );
    await user.click(screen.getByRole('option'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick on disabled items', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Listbox aria-label="Fruits">
        <Listbox.Item disabled onClick={handleClick}>Apple</Listbox.Item>
      </Listbox>
    );
    await user.click(screen.getByRole('option'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders groups with a label', () => {
    render(
      <Listbox aria-label="Food">
        <Listbox.Group label="Fruits">
          <Listbox.Item>Apple</Listbox.Item>
        </Listbox.Group>
        <Listbox.Group label="Vegetables">
          <Listbox.Item>Carrot</Listbox.Item>
        </Listbox.Group>
      </Listbox>
    );
    expect(screen.getByText('Fruits')).toBeInTheDocument();
    expect(screen.getByText('Vegetables')).toBeInTheDocument();
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Listbox aria-label="Fruits">
        <Listbox.Item>Apple</Listbox.Item>
        <Listbox.Item selected>Banana</Listbox.Item>
        <Listbox.Item disabled>Cherry</Listbox.Item>
      </Listbox>
    );
    await expectNoA11yViolations(container);
  });
});
