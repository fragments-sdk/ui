import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, waitFor, expectNoA11yViolations } from '../../test/utils';
import { CodeBlock } from './index';
import styles from './CodeBlock.module.scss';

// shiki is loaded dynamically via require() — no mock needed since it's in devDependencies

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

  it('uses overlay copy placement by default when filename is not provided', () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    expect(container.querySelector(`.${styles.header}`)).not.toBeInTheDocument();
    expect(container.querySelector(`.${styles.copyOverlay}`)).toBeInTheDocument();
  });

  it('hides copy button when showCopy is false', () => {
    render(<CodeBlock code="const x = 1;" showCopy={false} />);
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('shows language-highlighted content after shiki resolves', async () => {
    const { container } = render(<CodeBlock code="const x = 1;" language="typescript" />);
    await waitFor(() => {
      // shiki wraps output in a pre.shiki element with syntax-highlighted spans
      const shikiPre = container.querySelector('pre.shiki');
      expect(shikiPre).toBeInTheDocument();
      expect(shikiPre?.querySelector('code')).toBeInTheDocument();
    });
  });

  it('renders title and caption when provided', () => {
    render(<CodeBlock code="x = 1" title="Example" caption="A simple example" />);
    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.getByText('A simple example')).toBeInTheDocument();
  });

  it('renders filename in header', () => {
    const { container } = render(<CodeBlock code="x = 1" filename="app.ts" />);
    expect(screen.getByText('app.ts')).toBeInTheDocument();
    expect(container.querySelector(`.${styles.header}`)).toBeInTheDocument();
    expect(container.querySelector(`.${styles.copyOverlay}`)).not.toBeInTheDocument();
  });

  it('supports explicit copy placement variants', () => {
    const { container: headerContainer } = render(
      <CodeBlock code="const x = 1;" copyPlacement="header" />
    );
    expect(headerContainer.querySelector(`.${styles.header}`)).toBeInTheDocument();
    expect(headerContainer.querySelector(`.${styles.copyOverlay}`)).not.toBeInTheDocument();

    const { container: overlayContainer } = render(
      <CodeBlock code="const x = 1;" copyPlacement="overlay" filename="app.tsx" />
    );
    expect(overlayContainer.querySelector(`.${styles.header}`)).toBeInTheDocument();
    expect(overlayContainer.querySelector(`.${styles.copyOverlay}`)).toBeInTheDocument();
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

  it('normalizes indentation and wraps long JSX tags before copying', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    render(
      <CodeBlock
        code={`
<Chart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }} dataKey="users" type="monotone" stroke="var(--fui-color-info)" />
        `}
      />
    );
    await user.click(screen.getByRole('button', { name: /copy code/i }));

    expect(writeText).toHaveBeenCalledWith(`<Chart
  data={data}
  margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
  dataKey="users"
  type="monotone"
  stroke="var(--fui-color-info)"
/>`);
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

  it('supports controlled tabbed mode with explicit tab values', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();

    render(
      <CodeBlock.Tabbed
        value="js"
        onValueChange={onValueChange}
        tabs={[
          { label: 'Example', value: 'ts', language: 'typescript', code: 'const tsValue = 1;' },
          { label: 'Example', value: 'js', language: 'javascript', code: 'const jsValue = 1;' },
        ]}
      />
    );

    expect(screen.getByText('const jsValue = 1;')).toBeInTheDocument();
    const tabs = screen.getAllByRole('tab', { name: 'Example' });
    await user.click(tabs[0]);
    expect(onValueChange).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CodeBlock code="const x = 1;" />);
    await expectNoA11yViolations(container);
  });
});
