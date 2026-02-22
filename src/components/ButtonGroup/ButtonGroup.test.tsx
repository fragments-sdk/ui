import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { ButtonGroup } from './index';

describe('ButtonGroup', () => {
  it('renders children buttons', () => {
    render(
      <ButtonGroup>
        <button>Save</button>
        <button>Cancel</button>
      </ButtonGroup>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('applies gap class', () => {
    const { container } = render(
      <ButtonGroup gap="md">
        <button>A</button>
      </ButtonGroup>
    );
    expect(container.firstElementChild).toHaveClass('gap-md');
  });

  it('applies wrap class when wrap is true', () => {
    const { container } = render(
      <ButtonGroup wrap>
        <button>A</button>
      </ButtonGroup>
    );
    expect(container.firstElementChild).toHaveClass('wrap');
  });

  it('forwards DOM props to the group root', () => {
    render(
      <ButtonGroup data-testid="group" role="group" aria-label="Actions">
        <button>Save</button>
      </ButtonGroup>
    );
    expect(screen.getByTestId('group')).toHaveAttribute('aria-label', 'Actions');
    expect(screen.getByTestId('group')).toHaveAttribute('role', 'group');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ButtonGroup>
        <button>OK</button>
        <button>Cancel</button>
      </ButtonGroup>
    );
    await expectNoA11yViolations(container);
  });
});
