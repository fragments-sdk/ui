import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, fireEvent, expectNoA11yViolations } from '../../test/utils';
import { Prompt } from './index';

const promptStyles = readFileSync(
  resolve(process.cwd(), 'src/components/Prompt/Prompt.module.scss'),
  'utf8'
);

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

  it('marks the appearance on the root so the toolbar can drop its footer', () => {
    const { container, rerender } = render(
      <Prompt defaultValue="">
        <Prompt.Textarea />
      </Prompt>
    );
    expect(container.firstChild).toHaveAttribute('data-appearance', 'panel');

    rerender(
      <Prompt defaultValue="" appearance="seamless">
        <Prompt.Textarea />
      </Prompt>
    );
    expect(container.firstChild).toHaveAttribute('data-appearance', 'seamless');
  });

  it('composes shared action roles without subtree measurement overrides', () => {
    expect(promptStyles).toContain('@include action.icon-only("md")');
    expect(promptStyles).toContain('@include action.size("sm")');
    expect(promptStyles).toContain('@include action.icon-only("sm")');
    expect(promptStyles).toContain('@include action.icon-only("micro")');
    expect(promptStyles).toContain('@include target.hit-area("compact")');
    expect(promptStyles).not.toContain('--fui-target-size-min:');
    expect(promptStyles).not.toContain('--fui-button-height-sm:');
    expect(promptStyles).not.toContain('--fui-input-height-sm:');
    expect(promptStyles).not.toMatch(/(?:width|height):\s*(?:1|2)rem/);
    expect(promptStyles).toContain('font-size: var(--fui-font-size-sm, $fui-font-size-sm)');
    expect(promptStyles).toContain('width: var(--fui-icon-md, $fui-icon-md)');
    expect(promptStyles).toContain('&[data-popup-open]');
    expect(promptStyles).toContain(
      'box-shadow: inset 0 calc(var(--fui-space-px, #{$fui-space-px}) * -2) 0'
    );
    expect(promptStyles).toContain('margin-inline-end: var(--_control-padding)');
    expect(promptStyles).toContain(
      'background-color: var(--fui-text-primary, #{$fui-text-primary})'
    );
  });

  describe('Prompt.Select', () => {
    function renderWithSelect(props: { disabled?: boolean; promptDisabled?: boolean } = {}) {
      return render(
        <Prompt defaultValue="" disabled={props.promptDisabled}>
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.Select
                aria-label="Model"
                defaultValue="opus"
                disabled={props.disabled}
                options={[
                  { value: 'opus', label: 'Opus' },
                  { value: 'sonnet', label: 'Sonnet' },
                ]}
              />
            </Prompt.Actions>
          </Prompt.Toolbar>
        </Prompt>
      );
    }

    it('shows the current choice, labelled by what kind of choice it is', () => {
      renderWithSelect();
      const trigger = screen.getByRole('combobox', { name: /model/i });
      expect(trigger).toHaveTextContent('Opus');
    });

    it('reports the chosen value', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <Prompt defaultValue="">
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.Select
                aria-label="Model"
                defaultValue="opus"
                onValueChange={onValueChange}
                options={[
                  { value: 'opus', label: 'Opus' },
                  { value: 'sonnet', label: 'Sonnet' },
                ]}
              />
            </Prompt.Actions>
          </Prompt.Toolbar>
        </Prompt>
      );

      await user.click(screen.getByRole('combobox', { name: /model/i }));
      await user.click(await screen.findByRole('option', { name: 'Sonnet' }));
      expect(onValueChange).toHaveBeenCalledWith('sonnet');
    });

    it('follows the prompt into its disabled state', () => {
      renderWithSelect({ promptDisabled: true });
      expect(screen.getByRole('combobox', { name: /model/i })).toBeDisabled();
    });

    it('can be disabled on its own', () => {
      renderWithSelect({ disabled: true });
      expect(screen.getByRole('combobox', { name: /model/i })).toBeDisabled();
    });

    it('has no accessibility violations', async () => {
      const { container } = renderWithSelect();
      await expectNoA11yViolations(container);
    });
  });

  describe('files', () => {
    const png = () => new File(['x'], 'shot.png', { type: 'image/png' });

    it('hands picked files to onFiles', async () => {
      const user = userEvent.setup();
      const onFiles = vi.fn();

      const { container } = render(
        <Prompt defaultValue="" onFiles={onFiles} accept="image/*">
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.Attach />
            </Prompt.Actions>
          </Prompt.Toolbar>
        </Prompt>
      );

      const input = container.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toHaveAttribute('accept', 'image/*');
      await user.upload(input, png());
      expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'shot.png' })]);
    });

    it('disables attach when the consumer has not opted into files', () => {
      render(
        <Prompt defaultValue="">
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.Attach />
            </Prompt.Actions>
          </Prompt.Toolbar>
        </Prompt>
      );
      expect(screen.getByRole('button', { name: /attach files/i })).toBeDisabled();
    });

    it('takes files dropped anywhere on the card', () => {
      const onFiles = vi.fn();
      const { container } = render(
        <Prompt defaultValue="" onFiles={onFiles}>
          <Prompt.Textarea />
        </Prompt>
      );

      const card = container.firstChild as HTMLElement;
      const dataTransfer = { types: ['Files'], files: [png()], dropEffect: '' };

      fireEvent.dragEnter(card, { dataTransfer });
      expect(card).toHaveAttribute('data-dragging', 'true');

      fireEvent.drop(card, { dataTransfer });
      expect(card).not.toHaveAttribute('data-dragging');
      expect(onFiles).toHaveBeenCalledWith([expect.objectContaining({ name: 'shot.png' })]);
    });

    it('lists attachments and removes them', async () => {
      const user = userEvent.setup();
      const onRemove = vi.fn();

      render(
        <Prompt defaultValue="" onFiles={() => {}}>
          <Prompt.Attachments
            items={[{ id: 'a', name: 'shot.png', size: 2048 }]}
            onRemove={onRemove}
          />
          <Prompt.Textarea />
        </Prompt>
      );

      expect(screen.getByText('shot.png')).toBeInTheDocument();
      expect(screen.getByText('2 KB')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /remove shot.png/i }));
      expect(onRemove).toHaveBeenCalledWith('a');
    });

    it('has no accessibility violations with attachments', async () => {
      const { container } = render(
        <Prompt defaultValue="" onFiles={() => {}}>
          <Prompt.Attachments items={[{ id: 'a', name: 'shot.png' }]} onRemove={() => {}} />
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.Attach />
            </Prompt.Actions>
            <Prompt.Info>
              <Prompt.Submit />
            </Prompt.Info>
          </Prompt.Toolbar>
        </Prompt>
      );
      await expectNoA11yViolations(container);
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = renderPrompt();
    await expectNoA11yViolations(container);
  });
});
