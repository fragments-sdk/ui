import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { ThinkingIndicator } from './index';

describe('ThinkingIndicator', () => {
  it('renders with role="status" and aria-label', () => {
    render(<ThinkingIndicator />);
    // ThinkingIndicator contains a nested Loading with role="status", so use getAllByRole
    const statuses = screen.getAllByRole('status');
    expect(statuses.length).toBeGreaterThanOrEqual(1);
    const thinkingStatus = statuses.find(el => el.getAttribute('aria-label') === 'Thinking...');
    expect(thinkingStatus).toBeTruthy();
  });

  it('accepts custom label', () => {
    render(<ThinkingIndicator label="Processing..." />);
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('renders nothing when active is false', () => {
    const { container } = render(<ThinkingIndicator active={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders steps when provided', () => {
    const steps = [
      { id: '1', label: 'Analyzing', status: 'complete' as const },
      { id: '2', label: 'Generating', status: 'active' as const },
      { id: '3', label: 'Reviewing', status: 'pending' as const },
    ];
    render(<ThinkingIndicator steps={steps} />);
    expect(screen.getByText('Analyzing')).toBeInTheDocument();
    expect(screen.getByText('Generating')).toBeInTheDocument();
    expect(screen.getByText('Reviewing')).toBeInTheDocument();
  });

  it('renders step status indicators', () => {
    const steps = [
      { id: '1', label: 'Done', status: 'complete' as const },
      { id: '2', label: 'Failed', status: 'error' as const },
    ];
    const { container } = render(<ThinkingIndicator steps={steps} />);
    // Complete step renders a check icon (SVG), error step renders an X icon (SVG)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ThinkingIndicator label="Thinking about it" />
    );
    await expectNoA11yViolations(container);
  });
});
