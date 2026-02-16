import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { Accordion } from './index';

function renderAccordion(props: Partial<React.ComponentProps<typeof Accordion>> = {}) {
  return render(
    <Accordion {...props}>
      <Accordion.Item value="one">
        <Accordion.Trigger>Item One</Accordion.Trigger>
        <Accordion.Content>Content One</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="two">
        <Accordion.Trigger>Item Two</Accordion.Trigger>
        <Accordion.Content>Content Two</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="three">
        <Accordion.Trigger>Item Three</Accordion.Trigger>
        <Accordion.Content>Content Three</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}

describe('Accordion', () => {
  it('renders all triggers', () => {
    renderAccordion();
    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
    expect(screen.getByText('Item Three')).toBeInTheDocument();
  });

  it('opens an item when its trigger is clicked', async () => {
    const user = userEvent.setup();
    renderAccordion();

    const trigger = screen.getByRole('button', { name: /item one/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Content One')).toBeInTheDocument();
  });

  it('single type only allows one item open at a time', async () => {
    const user = userEvent.setup();
    renderAccordion({ type: 'single', collapsible: true });

    const triggerOne = screen.getByRole('button', { name: /item one/i });
    const triggerTwo = screen.getByRole('button', { name: /item two/i });

    await user.click(triggerOne);
    expect(triggerOne).toHaveAttribute('aria-expanded', 'true');

    await user.click(triggerTwo);
    expect(triggerTwo).toHaveAttribute('aria-expanded', 'true');
    expect(triggerOne).toHaveAttribute('aria-expanded', 'false');
  });

  it('multiple type allows multiple items open at once', async () => {
    const user = userEvent.setup();
    renderAccordion({ type: 'multiple' });

    const triggerOne = screen.getByRole('button', { name: /item one/i });
    const triggerTwo = screen.getByRole('button', { name: /item two/i });

    await user.click(triggerOne);
    await user.click(triggerTwo);

    expect(triggerOne).toHaveAttribute('aria-expanded', 'true');
    expect(triggerTwo).toHaveAttribute('aria-expanded', 'true');
  });

  it('links trigger aria-controls to content id', async () => {
    renderAccordion({ defaultValue: 'one' });

    const trigger = screen.getByRole('button', { name: /item one/i });
    const contentId = trigger.getAttribute('aria-controls');
    expect(contentId).toBeTruthy();
    expect(document.getElementById(contentId!)).toBeInTheDocument();
  });

  it('renders correct heading level', () => {
    renderAccordion({ headingLevel: 4 });
    const headings = document.querySelectorAll('h4');
    expect(headings.length).toBe(3);
  });

  it('defaults heading level to h3', () => {
    renderAccordion();
    const headings = document.querySelectorAll('h3');
    expect(headings.length).toBe(3);
  });

  it('disables an item when disabled prop is set', async () => {
    const user = userEvent.setup();
    render(
      <Accordion>
        <Accordion.Item value="one" disabled>
          <Accordion.Trigger>Disabled Item</Accordion.Trigger>
          <Accordion.Content>Hidden Content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const trigger = screen.getByRole('button', { name: /disabled item/i });
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('supports controlled value prop', async () => {
    const onValueChange = vi.fn();
    render(
      <Accordion value="one" onValueChange={onValueChange}>
        <Accordion.Item value="one">
          <Accordion.Trigger>Item One</Accordion.Trigger>
          <Accordion.Content>Content One</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="two">
          <Accordion.Trigger>Item Two</Accordion.Trigger>
          <Accordion.Content>Content Two</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );

    const triggerOne = screen.getByRole('button', { name: /item one/i });
    expect(triggerOne).toHaveAttribute('aria-expanded', 'true');

    const user = userEvent.setup();
    const triggerTwo = screen.getByRole('button', { name: /item two/i });
    await user.click(triggerTwo);
    expect(onValueChange).toHaveBeenCalledWith('two');
  });

  it('supports defaultValue for uncontrolled usage', () => {
    renderAccordion({ defaultValue: 'two' });
    const trigger = screen.getByRole('button', { name: /item two/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('collapsible prop allows full collapse in single type', async () => {
    const user = userEvent.setup();
    renderAccordion({ type: 'single', collapsible: true, defaultValue: 'one' });

    const trigger = screen.getByRole('button', { name: /item one/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('non-collapsible single type prevents full collapse', async () => {
    const user = userEvent.setup();
    renderAccordion({ type: 'single', collapsible: false, defaultValue: 'one' });

    const trigger = screen.getByRole('button', { name: /item one/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await user.click(trigger);
    // Should stay open because collapsible=false
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderAccordion({ defaultValue: 'one' });
    await expectNoA11yViolations(container, {
      // Accordion root role="region" + content panel role="region" triggers this.
      disabledRules: ['landmark-unique'],
    });
  });
});
