import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Tabs } from './index';

function renderTabs(props: Partial<React.ComponentProps<typeof Tabs>> = {}) {
  return render(
    <Tabs defaultValue="tab1" {...props}>
      <Tabs.List>
        <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
        <Tabs.Tab value="tab2">Tab Two</Tabs.Tab>
        <Tabs.Tab value="tab3" disabled>Tab Three</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="tab1">Panel One Content</Tabs.Panel>
      <Tabs.Panel value="tab2">Panel Two Content</Tabs.Panel>
      <Tabs.Panel value="tab3">Panel Three Content</Tabs.Panel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('renders tablist and tab roles', () => {
    renderTabs();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('renders tabpanel role for active panel', () => {
    renderTabs();
    expect(screen.getByRole('tabpanel')).toBeInTheDocument();
    expect(screen.getByText('Panel One Content')).toBeInTheDocument();
  });

  it('switches panel on tab click', async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole('tab', { name: /tab two/i }));
    expect(screen.getByText('Panel Two Content')).toBeInTheDocument();
  });

  it('marks active tab with aria-selected', async () => {
    const user = userEvent.setup();
    renderTabs();

    const tabOne = screen.getByRole('tab', { name: /tab one/i });
    const tabTwo = screen.getByRole('tab', { name: /tab two/i });

    expect(tabOne).toHaveAttribute('aria-selected', 'true');
    expect(tabTwo).toHaveAttribute('aria-selected', 'false');

    await user.click(tabTwo);
    expect(tabTwo).toHaveAttribute('aria-selected', 'true');
    expect(tabOne).toHaveAttribute('aria-selected', 'false');
  });

  it('disables a tab when disabled prop is set', () => {
    renderTabs();
    const disabledTab = screen.getByRole('tab', { name: /tab three/i });
    // Base UI uses aria-disabled instead of the HTML disabled attribute
    expect(disabledTab).toHaveAttribute('aria-disabled', 'true');
  });

  it('supports controlled value prop', async () => {
    const onValueChange = vi.fn();
    render(
      <Tabs value="tab1" onValueChange={onValueChange}>
        <Tabs.List>
          <Tabs.Tab value="tab1">Tab One</Tabs.Tab>
          <Tabs.Tab value="tab2">Tab Two</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="tab1">Panel One</Tabs.Panel>
        <Tabs.Panel value="tab2">Panel Two</Tabs.Panel>
      </Tabs>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole('tab', { name: /tab two/i }));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls[0][0]).toBe('tab2');
  });

  it('supports vertical orientation', () => {
    renderTabs({ orientation: 'vertical' });
    const tablist = screen.getByRole('tablist');
    expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderTabs();
    await expectNoA11yViolations(container);
  });
});
