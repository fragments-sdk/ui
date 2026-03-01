import type { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, expectNoA11yViolations, act } from '../../test/utils';
import { Editor } from './index';
import { Button } from '../Button';

function renderEditor(
  props: {
    placeholder?: string;
    disabled?: boolean;
    readOnly?: boolean;
    defaultValue?: string;
    onValueChange?: (v: string) => void;
    formats?: ('bold' | 'italic' | 'strikethrough' | 'link' | 'code' | 'bulletList')[];
    toolbarIcons?: Partial<Record<'bold' | 'italic' | 'strikethrough' | 'link' | 'code' | 'bulletList', ReactNode>>;
  } = {},
) {
  return render(
    <Editor
      placeholder={props.placeholder ?? 'Start typing your masterpiece here...'}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
      readOnly={props.readOnly}
      defaultValue={props.defaultValue}
      formats={props.formats}
      toolbarIcons={props.toolbarIcons}
    >
      <Editor.Toolbar>
        <Editor.ToolbarGroup aria-label="Text formatting">
          {(props.formats ?? ['bold', 'italic', 'code']).map((f) => (
            <Editor.ToolbarButton key={f} format={f} />
          ))}
        </Editor.ToolbarGroup>
        <Editor.ToolbarGroup aria-label="Actions">
          <Editor.StatusIndicator status="saved" />
          <Button variant="accent" size="sm">
            Publish
          </Button>
        </Editor.ToolbarGroup>
      </Editor.Toolbar>
      <Editor.Content />
      <Editor.StatusBar showWordCount showCharCount />
    </Editor>,
  );
}

/**
 * Find the editor content area. TipTap renders a contenteditable div,
 * the fallback renders a textarea. Both are accessible as textbox role.
 */
function getEditorInput() {
  // Try textarea first (markdown fallback), then contenteditable (TipTap)
  const textarea = document.querySelector('textarea');
  if (textarea) return textarea;
  const contenteditable = document.querySelector('[contenteditable]');
  if (contenteditable) return contenteditable as HTMLElement;
  throw new Error('Could not find editor content area');
}

describe('Editor', () => {
  it('renders editor content area with placeholder', () => {
    renderEditor({ placeholder: 'Write here...' });
    // TipTap stores placeholder on wrapper via data-placeholder;
    // textarea uses native placeholder. Check either.
    const wrapper = document.querySelector('[data-placeholder="Write here..."]');
    const textarea = document.querySelector('textarea[placeholder="Write here..."]');
    expect(wrapper || textarea).toBeTruthy();
  });

  it('renders toolbar with format buttons', () => {
    renderEditor({ formats: ['bold', 'italic', 'code'] });
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /italic/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /code/i })).toBeInTheDocument();
  });

  it('renders custom toolbar icons from toolbarIcons', () => {
    renderEditor({
      formats: ['bold'],
      toolbarIcons: {
        bold: <span data-testid="custom-bold-icon" aria-hidden="true">B*</span>,
      },
    });
    expect(screen.getByRole('button', { name: /bold/i })).toBeInTheDocument();
    expect(screen.getByTestId('custom-bold-icon')).toBeInTheDocument();
  });

  it('renders toolbar with proper ARIA role', () => {
    renderEditor();
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
  });

  it('renders toolbar groups with role="group"', () => {
    renderEditor();
    const groups = screen.getAllByRole('group');
    expect(groups.length).toBeGreaterThanOrEqual(2);
    expect(groups[0]).toHaveAttribute('aria-label', 'Text formatting');
    expect(groups[1]).toHaveAttribute('aria-label', 'Actions');
  });

  it('renders status indicator with AUTO-SAVED text', () => {
    renderEditor();
    expect(screen.getByText('AUTO-SAVED')).toBeInTheDocument();
  });

  it('renders status indicator with aria-live="polite"', () => {
    renderEditor();
    const indicator = screen.getByRole('status');
    expect(indicator).toHaveAttribute('aria-live', 'polite');
  });

  it('renders Publish button', () => {
    renderEditor();
    expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument();
  });

  it('renders status bar with word and character counts', () => {
    renderEditor({ defaultValue: 'Hello world' });
    expect(screen.getByText('2 Words')).toBeInTheDocument();
    expect(screen.getByText('11 Characters')).toBeInTheDocument();
  });

  it('shows singular "Word" for count of 1', () => {
    renderEditor({ defaultValue: 'Hello' });
    expect(screen.getByText('1 Word')).toBeInTheDocument();
  });

  it('shows 0 Words when empty', () => {
    renderEditor({ defaultValue: '' });
    expect(screen.getByText('0 Words')).toBeInTheDocument();
  });

  it('toolbar buttons have aria-pressed attribute', () => {
    renderEditor({ formats: ['bold'] });
    const boldBtn = screen.getByRole('button', { name: /bold/i });
    expect(boldBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('supports state-aware toolbar icon render functions', () => {
    render(
      <Editor
        formats={['bold']}
        toolbarIcons={{
          bold: ({ active, isDisabled }) => (
            <span
              data-testid="bold-icon-state"
              data-active={String(active)}
              data-disabled={String(isDisabled)}
              aria-hidden="true"
            />
          ),
        }}
      />
    );

    const icon = screen.getByTestId('bold-icon-state');
    expect(icon).toHaveAttribute('data-active', 'false');
    expect(icon).toHaveAttribute('data-disabled', 'false');
  });

  it('disables toolbar buttons when editor is disabled', () => {
    renderEditor({ disabled: true, formats: ['bold', 'italic'] });
    expect(screen.getByRole('button', { name: /bold/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /italic/i })).toBeDisabled();
  });

  it('sets data-disabled on root when disabled', () => {
    const { container } = renderEditor({ disabled: true });
    const root = container.firstElementChild;
    expect(root).toHaveAttribute('data-disabled');
  });

  it('sets contenteditable to false or disables textarea when disabled', () => {
    renderEditor({ disabled: true });
    const input = getEditorInput();
    if (input instanceof HTMLTextAreaElement) {
      expect(input).toBeDisabled();
    } else {
      expect(input).toHaveAttribute('contenteditable', 'false');
    }
  });

  it('sets data-readonly on root when readOnly', () => {
    const { container } = renderEditor({ readOnly: true });
    const root = container.firstElementChild;
    expect(root).toHaveAttribute('data-readonly');
  });

  it('disables toolbar buttons when readOnly', () => {
    renderEditor({ readOnly: true, formats: ['bold'] });
    expect(screen.getByRole('button', { name: /bold/i })).toBeDisabled();
  });

  it('renders with default toolbar and status bar when no children', () => {
    render(
      <Editor placeholder="Auto layout" formats={['bold', 'italic']} />,
    );
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    // Check placeholder via wrapper or native textarea
    const wrapper = document.querySelector('[data-placeholder="Auto layout"]');
    const textarea = document.querySelector('textarea[placeholder="Auto layout"]');
    expect(wrapper || textarea).toBeTruthy();
    expect(screen.getByText('0 Words')).toBeInTheDocument();
  });

  it('supports async onAutoSave callbacks and updates status after resolution', async () => {
    vi.useFakeTimers();
    let resolveSave: (() => void) | undefined;
    const onAutoSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        })
    );

    render(
      <Editor defaultValue="Hello world" onAutoSave={onAutoSave} autoSaveInterval={25}>
        <Editor.Content />
        <Editor.StatusIndicator />
      </Editor>
    );

    await vi.advanceTimersByTimeAsync(25);
    expect(onAutoSave).toHaveBeenCalledTimes(1);
    expect(String(onAutoSave.mock.calls[0][0])).toContain('Hello world');
    expect(screen.getByText('SAVING...')).toBeInTheDocument();

    await act(async () => {
      resolveSave?.();
      await Promise.resolve();
    });
    expect(screen.getByText('AUTO-SAVED')).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('has no accessibility violations', async () => {
    const { container } = renderEditor();
    await expectNoA11yViolations(container);
  });
});
