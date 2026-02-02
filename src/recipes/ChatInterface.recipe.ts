import { defineRecipe } from '@fragments/core';

export default defineRecipe({
  name: 'Chat Interface',
  description: 'AI chat interface with message history and prompt input',
  category: 'layout',
  components: ['Prompt', 'Card', 'Avatar', 'Stack'],
  tags: ['chat', 'ai', 'assistant', 'conversation'],
  code: `
import { useState } from 'react';
import { Prompt, Card, Avatar, Stack } from '@fragments-sdk/ui';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (value: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: value,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add assistant response
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'This is a simulated response. Replace with your AI API call.',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack gap="4" style={{ height: '100vh', padding: '1rem' }}>
      {/* Messages */}
      <Stack gap="3" style={{ flex: 1, overflow: 'auto' }}>
        {messages.map((msg) => (
          <Card key={msg.id} padding="md">
            <Card.Body>
              <Stack direction="row" gap="3" align="start">
                <Avatar size="sm">
                  {msg.role === 'user' ? 'U' : 'AI'}
                </Avatar>
                <div style={{ flex: 1 }}>{msg.content}</div>
              </Stack>
            </Card.Body>
          </Card>
        ))}
      </Stack>

      {/* Prompt */}
      <Prompt onSubmit={handleSubmit} loading={isLoading}>
        <Prompt.Textarea placeholder="Ask anything..." />
        <Prompt.Toolbar>
          <Prompt.Actions>
            <Prompt.ActionButton aria-label="Attach file">
              +
            </Prompt.ActionButton>
            <Prompt.ModeButton>Auto</Prompt.ModeButton>
          </Prompt.Actions>
          <Prompt.Info>
            <Prompt.Usage>52% used</Prompt.Usage>
            <Prompt.Submit />
          </Prompt.Info>
        </Prompt.Toolbar>
      </Prompt>
    </Stack>
  );
}
`.trim(),
});
