/**
 * Runtime CSS detection — warns once if component styles are not loaded.
 * Checks for a known CSS custom property set by globals.scss.
 */
let hasChecked = false;

export function checkCssLoaded(): void {
  if (hasChecked || typeof window === 'undefined') return;
  hasChecked = true;

  // Defer check to after styles have loaded
  requestAnimationFrame(() => {
    const root = document.documentElement;
    const value = getComputedStyle(root).getPropertyValue('--fui-text-primary').trim();

    if (!value) {
      console.warn(
        '[Fragments UI] Component styles not loaded. Components will render unstyled.\n\n' +
          'Add this import to your app entry point (e.g., main.tsx, layout.tsx):\n\n' +
          "  import '@fragments-sdk/ui/styles';\n\n" +
          'Next.js users also need:\n\n' +
          "  // next.config.ts\n" +
          "  transpilePackages: ['@fragments-sdk/ui']\n\n" +
          'Or run: npx @fragments-sdk/cli setup\n\n' +
          'Docs: https://usefragments.com/getting-started'
      );
    }
  });
}
