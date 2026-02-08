import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from '../../test/utils';
import { CodeBlock } from './index';

// Mock shiki to avoid loading real syntax highlighting in tests
vi.mock('shiki', () => ({
  codeToHtml: vi.fn(() => Promise.resolve('<pre class="shiki"><code>highlighted code</code></pre>')),
}));

describe('CodeBlock', () => {
  it('renders pre and code elements', async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    // Initially shows loading state with pre/code
    expect(container.querySelector('pre')).toBeInTheDocument();
    expect(container.querySelector('code')).toBeInTheDocument();
  });

  it('renders a copy button by default', () => {
    render(<CodeBlock code="const x = 1;" />);
    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
  });

  it('hides copy button when showCopy is false', () => {
    render(<CodeBlock code="const x = 1;" showCopy={false} />);
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('shows language-highlighted content after shiki resolves', async () => {
    render(<CodeBlock code="const x = 1;" language="typescript" />);
    await waitFor(() => {
      expect(screen.getByText('highlighted code')).toBeInTheDocument();
    });
  });

  it('renders title and caption when provided', () => {
    render(<CodeBlock code="x = 1" title="Example" caption="A simple example" />);
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('A simple example')).toBeInTheDocument();
  });

  it('renders filename in header', () => {
    render(<CodeBlock code="x = 1" filename="app.ts" />);
    expect(screen.getByText('app.ts')).toBeInTheDocument();
  });

  it('copies code to clipboard on copy button click', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(<CodeBlock code="const x = 1;" />);
    await user.click(screen.getByRole('button', { name: /copy code/i }));
    expect(writeText).toHaveBeenCalledWith('const x = 1;');
  });

  it('supports collapsible mode', async () => {
    const user = userEvent.setup();
    const longCode = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join('\n');
    render(<CodeBlock code={longCode} collapsible defaultCollapsed collapsedLines={5} />);
    // Should show expand button
    const expandBtn = screen.getByRole('button', { name: /expand code/i });
    expect(expandBtn).toBeInTheDocument();
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');

    await user.click(expandBtn);
    const collapseBtn = screen.getByRole('button', { name: /collapse code/i });
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    await expectNoA11yViolations(container);
  });
});
