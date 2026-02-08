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

  describe('keyboard & focus', () => {
    it('ArrowRight moves focus to the next tab', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.tab(); // focus enters the tablist on the active tab
      expect(screen.getByRole('tab', { name: /tab one/i })).toHaveFocus();

      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /tab two/i })).toHaveFocus();
    });

    it('ArrowLeft moves focus to the previous tab', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab2' });

      await user.tab();
      expect(screen.getByRole('tab', { name: /tab two/i })).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(screen.getByRole('tab', { name: /tab one/i })).toHaveFocus();
    });

    it('disabled tab receives focus but cannot be activated', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab2' });

      await user.tab();
      await user.keyboard('{ArrowRight}'); // moves to disabled Tab Three
      expect(screen.getByRole('tab', { name: /tab three/i })).toHaveFocus();
      // Pressing Enter/Space on a disabled tab should not activate it
      await user.keyboard('{Enter}');
      expect(screen.getByRole('tab', { name: /tab three/i })).toHaveAttribute('aria-selected', 'false');
    });

    it('wraps from last tab to first', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.tab();
      // Navigate: Tab One -> Tab Two -> Tab Three -> wraps to Tab One
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('tab', { name: /tab one/i })).toHaveFocus();
    });

    it('Home key moves focus to the first tab', async () => {
      const user = userEvent.setup();
      renderTabs({ defaultValue: 'tab2' });

      await user.tab();
      await user.keyboard('{Home}');
      expect(screen.getByRole('tab', { name: /tab one/i })).toHaveFocus();
    });

    it('End key moves focus to the last tab', async () => {
      const user = userEvent.setup();
      renderTabs();

      await user.tab();
      await user.keyboard('{End}');
      expect(screen.getByRole('tab', { name: /tab three/i })).toHaveFocus();
    });

    it('ArrowDown navigates tabs in vertical orientation', async () => {
      const user = userEvent.setup();
      renderTabs({ orientation: 'vertical' });

      await user.tab();
      expect(screen.getByRole('tab', { name: /tab one/i })).toHaveFocus();

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('tab', { name: /tab two/i })).toHaveFocus();
    });

    it('ArrowUp navigates tabs backward in vertical orientation', async () => {
      const user = userEvent.setup();
      renderTabs({ orientation: 'vertical', defaultValue: 'tab2' });

      await user.tab();
      expect(screen.getByRole('tab', { name: /tab two/i })).toHaveFocus();

      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('tab', { name: /tab one/i })).toHaveFocus();
    });
  });
});
