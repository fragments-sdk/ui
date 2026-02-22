import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Fieldset } from './index';

describe('Fieldset', () => {
  it('renders a fieldset element', () => {
    render(
      <Fieldset>
        <Fieldset.Legend>Personal Info</Fieldset.Legend>
        <input aria-label="Name" />
      </Fieldset>
    );
    // Base UI renders a fieldset element
    const fieldset = screen.getByRole('group');
    expect(fieldset).toBeInTheDocument();
  });

  it('renders a legend', () => {
    render(
      <Fieldset>
        <Fieldset.Legend>Contact Details</Fieldset.Legend>
      </Fieldset>
    );
    expect(screen.getByText('Contact Details')).toBeInTheDocument();
  });

  it('passes disabled prop to fieldset element', () => {
    const { container } = render(
      <Fieldset disabled>
        <Fieldset.Legend>Settings</Fieldset.Legend>
        <input aria-label="Option" />
      </Fieldset>
    );
    const fieldset = container.querySelector('fieldset');
    expect(fieldset).toBeInTheDocument();
    expect(fieldset).toHaveAttribute('data-disabled', '');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Fieldset>
        <Fieldset.Legend>Accessible fieldset</Fieldset.Legend>
        <input aria-label="Field" />
      </Fieldset>
    );
    await expectNoA11yViolations(container);
  });

  it('forwards DOM props to Fieldset.Legend', () => {
    render(
      <Fieldset>
        <Fieldset.Legend data-testid="legend" id="legend-id" aria-live="polite">
          Accessible legend
        </Fieldset.Legend>
      </Fieldset>
    );

    const legend = screen.getByTestId('legend');
    expect(legend).toHaveAttribute('id', 'legend-id');
    expect(legend).toHaveAttribute('aria-live', 'polite');
  });
});
