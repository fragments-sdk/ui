import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Form } from './index';

describe('Form', () => {
  it('renders a form element', () => {
    const { container } = render(<Form>content</Form>);
    expect(container.querySelector('form')).toBeInTheDocument();
  });

  it('calls onFormSubmit when submitted', async () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const user = userEvent.setup();
    render(
      <Form onFormSubmit={handleSubmit} aria-label="Test form">
        <button type="submit">Submit</button>
      </Form>
    );
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders children', () => {
    render(
      <Form aria-label="Test form">
        <span>Child content</span>
      </Form>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Form aria-label="Accessible form">
        <label htmlFor="f">Name</label>
        <input id="f" />
      </Form>
    );
    await expectNoA11yViolations(container);
  });
});
