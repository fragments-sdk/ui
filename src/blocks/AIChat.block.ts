import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'AI Chat',
  description: 'Complete AI chat interface with Message, ConversationList, Prompt, and ThinkingIndicator',
  category: 'ai',
  components: ['Message', 'ConversationList', 'ThinkingIndicator', 'Prompt', 'Stack'],
  tags: ['chat', 'ai', 'assistant', 'conversation', 'llm', 'chatbot'],
  code: `
import { useState, useCallback } from 'react';
import {
  Message,
  ConversationList,
  ThinkingIndicator,
  Prompt,
  Stack,
} from '@fragments/ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
}

interface ThinkingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
}

function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'system-1',
      role: 'system',
      content: 'Conversation started. Model: Claude 3.5 Sonnet',
      timestamp: new Date(),
      status: 'complete',
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const handleSubmit = useCallback(async (value: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: value,
      timestamp: new Date(),
      status: 'complete',
    };
    setMessages((prev) => [...prev, userMessage]);

    // Start thinking state with steps
    setIsThinking(true);
    setThinkingSteps([
      { id: '1', label: 'Understanding your request', status: 'active' },
      { id: '2', label: 'Searching knowledge base', status: 'pending' },
      { id: '3', label: 'Generating response', status: 'pending' },
    ]);

    try {
      // Simulate step 1 completion
      await new Promise((resolve) => setTimeout(resolve, 800));
      setThinkingSteps((prev) =>
        prev.map((s) =>
          s.id === '1'
            ? { ...s, status: 'complete' }
            : s.id === '2'
              ? { ...s, status: 'active' }
              : s
        )
      );

      // Simulate step 2 completion
      await new Promise((resolve) => setTimeout(resolve, 600));
      setThinkingSteps((prev) =>
        prev.map((s) =>
          s.id === '2'
            ? { ...s, status: 'complete' }
            : s.id === '3'
              ? { ...s, status: 'active' }
              : s
        )
      );

      // Simulate step 3 (response generation)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: generateMockResponse(value),
        timestamp: new Date(),
        status: 'complete',
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Handle error
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        status: 'error',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
      setThinkingSteps([]);
    }
  }, []);

  const handleLoadHistory = useCallback(async () => {
    if (isLoadingHistory) return;

    setIsLoadingHistory(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate loading older messages
    const olderMessages: ChatMessage[] = [
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: 'What can you help me with?',
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        status: 'complete',
      },
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I can help with coding, writing, analysis, and more!',
        timestamp: new Date(Date.now() - 86400000 + 1000),
        status: 'complete',
      },
    ];

    setMessages((prev) => [...olderMessages, ...prev]);
    setIsLoadingHistory(false);
  }, [isLoadingHistory]);

  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    // You might want to show a toast here
  }, []);

  return (
    <Stack
      style={{
        height: '100vh',
        maxWidth: '800px',
        margin: '0 auto',
        background: 'var(--fui-bg-primary)',
      }}
    >
      <ConversationList
        autoScroll="smart"
        onScrollTop={handleLoadHistory}
        loadingHistory={isLoadingHistory}
        emptyState={
          <Stack align="center" justify="center" style={{ flex: 1, padding: '2rem' }}>
            <p style={{ color: 'var(--fui-text-secondary)' }}>
              Start a conversation with the AI assistant
            </p>
          </Stack>
        }
      >
        {messages.map((msg, index) => {
          // Add date separator if day changed
          const prevMsg = messages[index - 1];
          const showDateSeparator =
            !prevMsg ||
            new Date(msg.timestamp).toDateString() !==
              new Date(prevMsg.timestamp).toDateString();

          return (
            <React.Fragment key={msg.id}>
              {showDateSeparator && (
                <ConversationList.DateSeparator date={msg.timestamp} />
              )}
              <Message
                role={msg.role}
                status={msg.status}
                timestamp={msg.timestamp}
                actions={
                  msg.role === 'assistant' && msg.status === 'complete' ? (
                    <>
                      <button
                        onClick={() => handleCopy(msg.content)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          background: 'var(--fui-bg-tertiary)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Copy
                      </button>
                    </>
                  ) : undefined
                }
              >
                <Message.Content>{msg.content}</Message.Content>
                {msg.timestamp && <Message.Timestamp />}
              </Message>
            </React.Fragment>
          );
        })}

        {isThinking && (
          <ThinkingIndicator
            variant="dots"
            label="Claude is thinking..."
            showElapsed
            steps={thinkingSteps}
          />
        )}
      </ConversationList>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--fui-border)' }}>
        <Prompt
          onSubmit={handleSubmit}
          loading={isThinking}
          placeholder="Message Claude..."
        >
          <Prompt.Textarea />
          <Prompt.Toolbar>
            <Prompt.Actions>
              <Prompt.ActionButton aria-label="Attach file">
                +
              </Prompt.ActionButton>
              <Prompt.ModeButton active>Auto</Prompt.ModeButton>
            </Prompt.Actions>
            <Prompt.Info>
              <Prompt.Submit />
            </Prompt.Info>
          </Prompt.Toolbar>
        </Prompt>
      </div>
    </Stack>
  );
}

// Mock response generator
function generateMockResponse(input: string): string {
  const responses = [
    "That's a great question! Let me help you with that.",
    "I understand what you're looking for. Here's what I can tell you...",
    "Based on my knowledge, I can provide some insights on this topic.",
    "Let me break this down for you step by step.",
  ];
  return responses[Math.floor(Math.random() * responses.length)] +
    " This is a simulated response. In a real implementation, this would be replaced with actual AI-generated content based on your query about: " +
    input.substring(0, 50) + (input.length > 50 ? '...' : '');
}

export default AIChat;
`.trim(),
});
