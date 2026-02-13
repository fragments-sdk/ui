import React from 'react';
import { render, screen, userEvent, expectNoA11yViolations } from '../../test/utils';
import { fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { NavigationMenu } from '.';

// Mock matchMedia for jsdom
beforeAll(() => {
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
});

// ============================================
// Helpers
// ============================================

function renderBasicMenu(props: Record<string, unknown> = {}) {
  return render(
    <NavigationMenu {...props}>
      <NavigationMenu.List>
        <NavigationMenu.Item value="learn">
          <NavigationMenu.Trigger>Learn</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/docs" title="Documentation" description="Start building." />
            <NavigationMenu.Link href="/tutorials" title="Tutorials" description="Step-by-step guides." />
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item value="community">
          <NavigationMenu.Trigger>Community</NavigationMenu.Trigger>
          <NavigationMenu.Content>
            <NavigationMenu.Link href="/forum">Forum</NavigationMenu.Link>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link href="/blog">Blog</NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
      <NavigationMenu.Viewport />
    </NavigationMenu>
  );
}

// ============================================
// Rendering
// ============================================

describe('NavigationMenu', () => {
  describe('Rendering', () => {
    it('renders a nav element', () => {
      renderBasicMenu();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('renders with default aria-label', () => {
      renderBasicMenu();
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('renders with custom aria-label', () => {
      renderBasicMenu({ 'aria-label': 'Site navigation' });
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Site navigation');
    });

    it('renders trigger buttons', () => {
      renderBasicMenu();
      expect(screen.getByText('Learn')).toBeInTheDocument();
      expect(screen.getByText('Community')).toBeInTheDocument();
    });

    it('renders direct links', () => {
      renderBasicMenu();
      expect(screen.getByText('Blog')).toBeInTheDocument();
    });

    it('renders viewport', () => {
      renderBasicMenu();
      expect(screen.getByRole('presentation')).toBeInTheDocument();
    });

    it('accepts data-orientation attribute', () => {
      renderBasicMenu({ orientation: 'vertical' });
      expect(screen.getByRole('navigation')).toHaveAttribute('data-orientation', 'vertical');
    });
  });

  // ============================================
  // Trigger
  // ============================================

  describe('Trigger', () => {
    it('has aria-expanded=false when closed', () => {
      renderBasicMenu();
      const trigger = screen.getByText('Learn');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('has aria-expanded=true when open', async () => {
      renderBasicMenu();
      const trigger = screen.getByText('Learn');
      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('toggles content on click', async () => {
      renderBasicMenu();
      const trigger = screen.getByText('Learn');

      // Click to open
      await userEvent.click(trigger);
      expect(screen.getByText('Documentation')).toBeInTheDocument();

      // Click to close
      await userEvent.click(trigger);
      expect(screen.queryByText('Documentation')).not.toBeInTheDocument();
    });

    it('shows content panel with structured links', async () => {
      renderBasicMenu();
      await userEvent.click(screen.getByText('Learn'));
      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Start building.')).toBeInTheDocument();
    });

    it('has aria-controls pointing to content', async () => {
      renderBasicMenu();
      const trigger = screen.getByText('Learn');
      const controlsId = trigger.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();

      await userEvent.click(trigger);
      const content = document.getElementById(controlsId!);
      expect(content).toBeInTheDocument();
    });
  });

  // ============================================
  // Hover behavior
  // ============================================

  describe('Hover', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('opens on pointer enter after delay', () => {
      renderBasicMenu({ delayDuration: 100 });
      const trigger = screen.getByText('Learn');

      fireEvent.pointerEnter(trigger);
      expect(screen.queryByText('Documentation')).not.toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.getByText('Documentation')).toBeInTheDocument();
    });

    it('cancels open when pointer leaves before delay', () => {
      renderBasicMenu({ delayDuration: 200 });
      const trigger = screen.getByText('Learn');

      fireEvent.pointerEnter(trigger);
      act(() => {
        vi.advanceTimersByTime(100);
      });
      fireEvent.pointerLeave(trigger);

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(screen.queryByText('Documentation')).not.toBeInTheDocument();
    });

    it('keeps open when pointer enters content panel', () => {
      renderBasicMenu({ delayDuration: 50 });
      const trigger = screen.getByText('Learn');

      // Open via click for simplicity
      fireEvent.click(trigger);
      expect(screen.getByText('Documentation')).toBeInTheDocument();

      // Leave trigger — starts close timer
      fireEvent.pointerLeave(trigger);

      // Enter content — should cancel close
      const content = screen.getByRole('region');
      fireEvent.pointerEnter(content);

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should still be open
      expect(screen.getByText('Documentation')).toBeInTheDocument();
    });
  });

  // ============================================
  // Keyboard
  // ============================================

  describe('Keyboard', () => {
    it('opens content on Enter', async () => {
      renderBasicMenu();
      const trigger = screen.getByText('Learn');
      trigger.focus();
      await userEvent.keyboard('{Enter}');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens content on Space', async () => {
      renderBasicMenu();
      const trigger = screen.getByText('Learn');
      trigger.focus();
      await userEvent.keyboard(' ');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes content on Escape', async () => {
      renderBasicMenu();
      const trigger = screen.getByText('Learn');
      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await userEvent.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('navigates between triggers with arrow keys', () => {
      renderBasicMenu();
      const learnTrigger = screen.getByText('Learn');
      const communityTrigger = screen.getByText('Community');

      learnTrigger.focus();
      expect(document.activeElement).toBe(learnTrigger);

      // ArrowRight moves to next trigger
      fireEvent.keyDown(learnTrigger.closest('ul')!, { key: 'ArrowRight' });
      expect(document.activeElement).toBe(communityTrigger);
    });

    it('navigates to first trigger on Home', () => {
      renderBasicMenu();
      const communityTrigger = screen.getByText('Community');
      const learnTrigger = screen.getByText('Learn');

      communityTrigger.focus();
      fireEvent.keyDown(communityTrigger.closest('ul')!, { key: 'Home' });
      expect(document.activeElement).toBe(learnTrigger);
    });

    it('navigates to last trigger on End', () => {
      renderBasicMenu();
      const learnTrigger = screen.getByText('Learn');
      const communityTrigger = screen.getByText('Community');

      learnTrigger.focus();
      fireEvent.keyDown(learnTrigger.closest('ul')!, { key: 'End' });
      expect(document.activeElement).toBe(communityTrigger);
    });
  });

  // ============================================
  // Link
  // ============================================

  describe('Link', () => {
    it('renders simple link', () => {
      renderBasicMenu();
      const blogLink = screen.getByText('Blog');
      expect(blogLink).toHaveAttribute('href', '/blog');
    });

    it('renders structured link with title and description', async () => {
      renderBasicMenu();
      await userEvent.click(screen.getByText('Learn'));

      expect(screen.getByText('Documentation')).toBeInTheDocument();
      expect(screen.getByText('Start building.')).toBeInTheDocument();
    });

    it('sets aria-current=page when active', () => {
      render(
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/blog" active>Blog</NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu>
      );

      expect(screen.getByText('Blog')).toHaveAttribute('aria-current', 'page');
    });

    it('renders featured link with featured styles', async () => {
      render(
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item value="test">
              <NavigationMenu.Trigger>Test</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="/featured" title="Featured" description="Special item" featured />
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu>
      );

      await userEvent.click(screen.getByText('Test'));
      const featuredLink = screen.getByText('Featured').closest('a');
      expect(featuredLink?.className).toContain('Featured');
    });

    it('renders as child when asChild=true', () => {
      render(
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/blog" asChild>
                <a href="/blog" data-testid="custom-link">Blog</a>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu>
      );

      expect(screen.getByTestId('custom-link')).toBeInTheDocument();
    });
  });

  // ============================================
  // Controlled
  // ============================================

  describe('Controlled', () => {
    it('respects controlled value', () => {
      render(
        <NavigationMenu value="learn">
          <NavigationMenu.List>
            <NavigationMenu.Item value="learn">
              <NavigationMenu.Trigger>Learn</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu>
      );

      expect(screen.getByText('Learn')).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Docs')).toBeInTheDocument();
    });

    it('calls onValueChange when trigger is clicked', async () => {
      const onValueChange = vi.fn();
      render(
        <NavigationMenu value="" onValueChange={onValueChange}>
          <NavigationMenu.List>
            <NavigationMenu.Item value="learn">
              <NavigationMenu.Trigger>Learn</NavigationMenu.Trigger>
              <NavigationMenu.Content>
                <NavigationMenu.Link href="/docs">Docs</NavigationMenu.Link>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu>
      );

      await userEvent.click(screen.getByText('Learn'));
      expect(onValueChange).toHaveBeenCalledWith('learn');
    });
  });

  // ============================================
  // Content region
  // ============================================

  describe('Content region', () => {
    it('has role=region', async () => {
      renderBasicMenu();
      await userEvent.click(screen.getByText('Learn'));
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has aria-labelledby pointing to trigger', async () => {
      renderBasicMenu();
      const trigger = screen.getByText('Learn');
      await userEvent.click(trigger);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-labelledby', trigger.id);
    });
  });

  // ============================================
  // Accessibility
  // ============================================

  describe('Accessibility', () => {
    it('has no axe violations when closed', async () => {
      const { container } = renderBasicMenu();
      await expectNoA11yViolations(container);
    });

    it('has no axe violations when open', async () => {
      const { container } = renderBasicMenu();
      await userEvent.click(screen.getByText('Learn'));
      await expectNoA11yViolations(container);
    });
  });

  // ============================================
  // MobileContent + MobileSection
  // ============================================

  describe('MobileContent', () => {
    it('renders nothing on desktop', () => {
      render(
        <NavigationMenu>
          <NavigationMenu.List>
            <NavigationMenu.Item>
              <NavigationMenu.Link href="/blog">Blog</NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
          <NavigationMenu.MobileContent>
            <NavigationMenu.MobileSection label="Extra">
              <NavigationMenu.Link href="/extra">Extra Link</NavigationMenu.Link>
            </NavigationMenu.MobileSection>
          </NavigationMenu.MobileContent>
        </NavigationMenu>
      );

      // MobileContent renders nothing in the tree (it registers children in context)
      // On desktop, hamburger is hidden, drawer is not rendered
      expect(screen.queryByText('Extra')).not.toBeInTheDocument();
    });
  });
});
