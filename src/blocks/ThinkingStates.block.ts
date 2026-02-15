import { defineBlock } from '@fragments-sdk/cli/core';

export default defineBlock({
  name: 'Thinking States',
  description: 'Various AI thinking indicator states: dots, pulse, spinner with steps',
  category: 'ai',
  components: ['Stack', 'Card', 'ThinkingIndicator'],
  tags: ['thinking', 'loading', 'ai', 'indicator', 'spinner'],
  code: `
<Stack gap="lg">
  <Card>
    <Card.Header>
      <Card.Title>Dots Animation</Card.Title>
    </Card.Header>
    <Card.Body>
      <ThinkingIndicator variant="dots" label="Thinking..." />
    </Card.Body>
  </Card>

  <Card>
    <Card.Header>
      <Card.Title>Pulse Animation</Card.Title>
    </Card.Header>
    <Card.Body>
      <ThinkingIndicator variant="pulse" label="Processing request..." />
    </Card.Body>
  </Card>

  <Card>
    <Card.Header>
      <Card.Title>Spinner with Steps</Card.Title>
    </Card.Header>
    <Card.Body>
      <ThinkingIndicator
        variant="spinner"
        label="Working on your request..."
        showElapsed
        steps={[
          { id: '1', label: 'Understanding your question', status: 'complete' },
          { id: '2', label: 'Searching knowledge base', status: 'active' },
          { id: '3', label: 'Generating response', status: 'pending' },
        ]}
      />
    </Card.Body>
  </Card>
</Stack>
`.trim(),
});
