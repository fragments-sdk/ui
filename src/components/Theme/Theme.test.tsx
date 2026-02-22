import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { ThemeProvider, ThemeToggle, useTheme } from './index';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia for system preference detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('provides theme context to children', () => {
    function Consumer() {
      const { mode } = useTheme();
      return <span>Mode: {mode}</span>;
    }
    render(
      <ThemeProvider defaultMode="dark">
        <Consumer />
      </ThemeProvider>
    );
    expect(screen.getByText('Mode: dark')).toBeInTheDocument();
  });

  it('useTheme returns safe defaults outside provider', () => {
    function Consumer() {
      const { mode, resolvedMode } = useTheme();
      return <span>Mode: {mode}, Resolved: {resolvedMode}</span>;
    }
    render(<Consumer />);
    expect(screen.getByText('Mode: system, Resolved: light')).toBeInTheDocument();
  });

  it('supports controlled mode', () => {
    function Consumer() {
      const { mode } = useTheme();
      return <span>Mode: {mode}</span>;
    }
    render(
      <ThemeProvider mode="light">
        <Consumer />
      </ThemeProvider>
    );
    expect(screen.getByText('Mode: light')).toBeInTheDocument();
  });
});

describe('ThemeToggle', () => {
  it('renders light and dark toggle buttons', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: /light mode/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dark mode/i })).toBeInTheDocument();
  });

  it('toggles between light and dark on click', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultMode="light">
        <ThemeToggle />
      </ThemeProvider>
    );
    const darkBtn = screen.getByRole('button', { name: /dark mode/i });
    await user.click(darkBtn);
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders within a group with aria-label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle aria-label="Switch theme" />
      </ThemeProvider>
    );
    expect(screen.getByRole('group', { name: 'Switch theme' })).toBeInTheDocument();
  });

  it('forwards DOM props to the toggle group', () => {
    render(
      <ThemeProvider>
        <ThemeToggle data-testid="theme-toggle" id="theme-toggle-group" />
      </ThemeProvider>
    );

    const group = screen.getByTestId('theme-toggle');
    expect(group).toHaveAttribute('id', 'theme-toggle-group');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );
    await expectNoA11yViolations(container);
  });
});
