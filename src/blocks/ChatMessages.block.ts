import { defineBlock } from '@fragments-sdk/cli/core';

export default defineBlock({
  name: 'Chat Messages',
  description: 'User and assistant message exchange with role-based styling',
  category: 'ai',
  components: ['Stack', 'Message'],
  tags: ['chat', 'messages', 'ai', 'conversation'],
  code: `
<Stack gap="md" style={{ maxWidth: '600px' }}>
  <Message role="user">
    <Message.Content>
      Can you explain how React hooks work?
    </Message.Content>
  </Message>
  <Message role="assistant">
    <Message.Content>
      React Hooks are functions that let you use state and other React features in functional components. The most common hooks are:

      • useState - for managing local state
      • useEffect - for side effects like API calls
      • useContext - for consuming context values
      • useRef - for mutable refs that persist across renders

      Would you like me to show you some examples?
    </Message.Content>
  </Message>
  <Message role="user">
    <Message.Content>
      Yes, please show me a useState example!
    </Message.Content>
  </Message>
</Stack>
`.trim(),
});
