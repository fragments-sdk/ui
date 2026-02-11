import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Chat Interface',
  description: 'Full AI chat with conversation list, messages, and prompt input',
  category: 'ai',
  components: ['Stack', 'ConversationList', 'Message', 'Prompt'],
  tags: ['chat', 'ai', 'assistant', 'conversation', 'prompt'],
  code: `
<Stack style={{ height: '500px', border: '1px solid var(--fui-border)', borderRadius: 'var(--fui-radius-lg)', overflow: 'hidden' }}>
  <ConversationList autoScroll="smart" style={{ flex: 1 }}>
    <Message role="system">
      <Message.Content>
        Conversation started with Claude
      </Message.Content>
    </Message>
    <Message role="user">
      <Message.Content>
        Hello! What can you help me with today?
      </Message.Content>
    </Message>
    <Message role="assistant">
      <Message.Content>
        Hi! I'm here to help with coding questions, writing, analysis, and more. What would you like to explore?
      </Message.Content>
    </Message>
  </ConversationList>
  <div style={{ borderTop: '1px solid var(--fui-border)' }}>
    <Prompt placeholder="Message Claude..." onSubmit={(value) => console.log(value)}>
      <Prompt.Textarea />
      <Prompt.Toolbar>
        <Prompt.Actions>
          <Prompt.ActionButton aria-label="Attach file">+</Prompt.ActionButton>
        </Prompt.Actions>
        <Prompt.Info>
          <Prompt.Submit />
        </Prompt.Info>
      </Prompt.Toolbar>
    </Prompt>
  </div>
</Stack>
`.trim(),
});
