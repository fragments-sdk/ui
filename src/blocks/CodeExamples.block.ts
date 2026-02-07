import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Code Examples',
  description: 'Patterns for displaying code in documentation with syntax highlighting',
  category: 'documentation',
  components: ['CodeBlock', 'Tabs', 'Card'],
  tags: ['code', 'documentation', 'syntax', 'examples'],
  code: `
// Installation commands with package manager tabs
<Tabs defaultValue="npm">
  <Tabs.List>
    <Tabs.Tab value="npm">npm</Tabs.Tab>
    <Tabs.Tab value="pnpm">pnpm</Tabs.Tab>
    <Tabs.Tab value="yarn">yarn</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="npm">
    <CodeBlock code="npm install @fragments-sdk/ui" language="bash" />
  </Tabs.Panel>
  <Tabs.Panel value="pnpm">
    <CodeBlock code="pnpm add @fragments-sdk/ui" language="bash" />
  </Tabs.Panel>
  <Tabs.Panel value="yarn">
    <CodeBlock code="yarn add @fragments-sdk/ui" language="bash" />
  </Tabs.Panel>
</Tabs>

// Usage example with preview
<Card>
  <Card.Header>
    <Card.Title>Button Example</Card.Title>
  </Card.Header>
  <Card.Body>
    <div className="preview">
      <Button variant="primary">Click me</Button>
    </div>
    <CodeBlock
      code={\`<Button variant="primary">Click me</Button>\`}
      language="tsx"
    />
  </Card.Body>
</Card>

// Multi-file example with titles
<CodeBlock
  title="Button.tsx"
  code={buttonCode}
  language="tsx"
  showLineNumbers
/>
<CodeBlock
  title="Button.module.scss"
  code={stylesCode}
  language="scss"
  showLineNumbers
/>

// Highlighted important lines
<CodeBlock
  code={exampleCode}
  language="tsx"
  showLineNumbers
  highlightLines={[3, "7-10"]}
/>
`.trim(),
});
