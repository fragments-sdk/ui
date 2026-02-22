import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Prompt } from './index';

function renderPrompt(props: {
  onSubmit?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultValue?: string;
  loading?: boolean;
} = {}) {
  return render(
    <Prompt
      placeholder={props.placeholder ?? 'Ask something...'}
      onSubmit={props.onSubmit}
      disabled={props.disabled}
      defaultValue={props.defaultValue}
      loading={props.loading}
    >
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Actions>
          <Prompt.ActionButton aria-label="Attach file">Attach</Prompt.ActionButton>
        </Prompt.Actions>
      </Prompt.Toolbar>
      <Prompt.Submit />
    </Prompt>
  );
}

describe('Prompt', () => {
  it('renders a textarea with placeholder', () => {
    renderPrompt({ placeholder: 'Type here...' });
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });

  it('forwards textarea props and composes textarea handlers', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const onChange = vi.fn();

    render(
      <Prompt defaultValue="" onSubmit={() => {}}>
        <Prompt.Textarea data-testid="prompt-textarea" onKeyDown={onKeyDown} onChange={onChange} />
        <Prompt.Submit />
      </Prompt>
    );

    const textarea = screen.getByTestId('prompt-textarea');
    await user.type(textarea, 'Hi');
    expect(onChange).toHaveBeenCalled();
    await user.keyboard('{Enter}');
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('renders compound sub-components (Toolbar, Actions)', () => {
    renderPrompt();
    expect(screen.getByRole('button', { name: /attach file/i })).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderPrompt();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('disables submit when value is empty', () => {
    renderPrompt();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('enables submit when user types text', async () => {
    const user = userEvent.setup();
    renderPrompt();
    const textarea = screen.getByPlaceholderText('Ask something...');
    await user.type(textarea, 'Hello');
    expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
  });

  it('calls onSubmit when submit button is clicked', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    renderPrompt({ onSubmit: handleSubmit, defaultValue: 'Test message' });

    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleSubmit).toHaveBeenCalledWith('Test message');
  });

  it('submits on Enter key by default (submitOnEnter)', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    renderPrompt({ onSubmit: handleSubmit });

    const textarea = screen.getByPlaceholderText('Ask something...');
    await user.type(textarea, 'Hello');
    await user.keyboard('{Enter}');
    expect(handleSubmit).toHaveBeenCalledWith('Hello');
  });

  it('disables all controls when disabled prop is true', () => {
    renderPrompt({ disabled: true });
    expect(screen.getByPlaceholderText('Ask something...')).toBeDisabled();
    expect(screen.getByRole('button', { name: /attach file/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });

  it('shows loading spinner icon in submit button when loading', () => {
    renderPrompt({ loading: true, defaultValue: 'Submitting...' });
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
    expect(screen.getByRole('status', { name: /submitting/i })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderPrompt();
    await expectNoA11yViolations(container);
  });
});
