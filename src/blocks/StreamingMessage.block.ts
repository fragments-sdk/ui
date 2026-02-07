import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Streaming Message',
  description: 'AI message with streaming cursor animation showing real-time response',
  category: 'ai',
  components: ['Stack', 'Message'],
  tags: ['streaming', 'message', 'ai', 'cursor', 'real-time'],
  code: `
<Stack gap="md" style={{ maxWidth: '600px' }}>
  <Message role="user">
    <Message.Content>
      Write a haiku about programming
    </Message.Content>
  </Message>
  <Message role="assistant" status="streaming">
    <Message.Content>
      Lines of code compile,
      Bugs emerge from the shadows
    </Message.Content>
  </Message>
</Stack>
`.trim(),
});
