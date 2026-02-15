import { defineBlock } from '@fragments-sdk/cli/core';

export default defineBlock({
  name: 'Navigation Header',
  description:
    'Site header with rich dropdown navigation panels, structured links with descriptions, and automatic mobile drawer. Uses NavigationMenu inside Header.',
  category: 'marketing',
  components: [
    'Header',
    'NavigationMenu',
    'ThemeToggle',
    'Button',
  ],
  tags: ['header', 'navigation', 'dropdown', 'mobile', 'responsive', 'navbar'],
  code: `
<Header>
  <Header.Brand href="/">Acme</Header.Brand>
  <NavigationMenu aria-label="Main navigation">
    <NavigationMenu.List>
      <NavigationMenu.Item value="products">
        <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', padding: '8px', minWidth: '400px' }}>
            <NavigationMenu.Link
              href="/analytics"
              title="Analytics"
              description="Track your metrics and KPIs in real time."
            />
            <NavigationMenu.Link
              href="/automation"
              title="Automation"
              description="Automate repetitive workflows with ease."
            />
            <NavigationMenu.Link
              href="/integrations"
              title="Integrations"
              description="Connect with your favorite tools."
            />
            <NavigationMenu.Link
              href="/security"
              title="Security"
              description="Enterprise-grade protection for your data."
            />
          </div>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item value="resources">
        <NavigationMenu.Trigger>Resources</NavigationMenu.Trigger>
        <NavigationMenu.Content>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', minWidth: '220px' }}>
            <NavigationMenu.Link
              href="/docs"
              title="Documentation"
              description="Comprehensive API reference and guides."
            />
            <NavigationMenu.Link
              href="/blog"
              title="Blog"
              description="Latest news, updates, and tutorials."
            />
            <NavigationMenu.Link
              href="/changelog"
              title="Changelog"
              description="See what's new in every release."
            />
          </div>
        </NavigationMenu.Content>
      </NavigationMenu.Item>
      <NavigationMenu.Item>
        <NavigationMenu.Link href="/pricing">Pricing</NavigationMenu.Link>
      </NavigationMenu.Item>
    </NavigationMenu.List>
    <NavigationMenu.Viewport />
    <NavigationMenu.MobileContent>
      <NavigationMenu.MobileSection label="Company">
        <NavigationMenu.Link href="/about">About</NavigationMenu.Link>
        <NavigationMenu.Link href="/careers">Careers</NavigationMenu.Link>
        <NavigationMenu.Link href="/contact">Contact</NavigationMenu.Link>
      </NavigationMenu.MobileSection>
    </NavigationMenu.MobileContent>
  </NavigationMenu>
  <Header.Spacer />
  <Header.Actions>
    <ThemeToggle size="md" />
    <Button variant="primary" size="sm">Get Started</Button>
  </Header.Actions>
</Header>
`.trim(),
});
