import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Field } from './index';

describe('Field', () => {
  it('renders children inside the field root', () => {
    render(
      <Field>
        <Field.Label>Username</Field.Label>
        <Field.Control><input /></Field.Control>
      </Field>
    );
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('associates label with control', () => {
    render(
      <Field>
        <Field.Label>Username</Field.Label>
        <Field.Control><input /></Field.Control>
      </Field>
    );
    expect(screen.getByRole('textbox')).toHaveAccessibleName('Username');
  });

  it('renders description text', () => {
    render(
      <Field>
        <Field.Label>Email</Field.Label>
        <Field.Control><input /></Field.Control>
        <Field.Description>We will never share your email.</Field.Description>
      </Field>
    );
    expect(screen.getByText('We will never share your email.')).toBeInTheDocument();
  });

  it('sets aria-invalid on control when invalid', () => {
    render(
      <Field invalid>
        <Field.Label>Email</Field.Label>
        <Field.Control><input /></Field.Control>
      </Field>
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('exposes compound component pattern', () => {
    expect(Field.Label).toBeDefined();
    expect(Field.Control).toBeDefined();
    expect(Field.Description).toBeDefined();
    expect(Field.Error).toBeDefined();
    expect(Field.Validity).toBeDefined();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Field>
        <Field.Label>Accessible field</Field.Label>
        <Field.Control><input /></Field.Control>
      </Field>
    );
    await expectNoA11yViolations(container);
  });
});
