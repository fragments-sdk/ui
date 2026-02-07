import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Conversation with History',
  description: 'Chat with date separators, timestamps and message history',
  category: 'ai',
  components: ['ConversationList', 'Message'],
  tags: ['conversation', 'history', 'chat', 'ai', 'timestamps'],
  code: `
<div style={{ height: '400px', border: '1px solid var(--fui-border)', borderRadius: 'var(--fui-radius-lg)', overflow: 'hidden' }}>
  <ConversationList autoScroll="smart">
    <ConversationList.DateSeparator date={new Date(Date.now() - 86400000)} />
    <Message role="user">
      <Message.Content>
        Hey, can you help me with a Python question?
      </Message.Content>
      <Message.Timestamp />
    </Message>
    <Message role="assistant" timestamp={new Date(Date.now() - 86400000 + 60000)}>
      <Message.Content>
        Of course! What would you like to know about Python?
      </Message.Content>
      <Message.Timestamp />
    </Message>

    <ConversationList.DateSeparator date={new Date()} />
    <Message role="user">
      <Message.Content>
        How do I read a file in Python?
      </Message.Content>
      <Message.Timestamp />
    </Message>
    <Message role="assistant" timestamp={new Date()}>
      <Message.Content>
        You can use the open() function with a context manager. Here's an example:

        with open('file.txt', 'r') as f:
            content = f.read()
      </Message.Content>
      <Message.Timestamp />
    </Message>
  </ConversationList>
</div>
`.trim(),
});
