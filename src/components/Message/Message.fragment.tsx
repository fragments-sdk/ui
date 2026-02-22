import React from 'react';
import { defineFragment } from '@fragments-sdk/core';
import { Message } from '.';

export default defineFragment({
  component: Message,

  meta: {
    name: 'Message',
    description: 'Individual chat message display with role-based styling',
    category: 'ai',
    status: 'stable',
    tags: ['message', 'chat', 'ai', 'conversation', 'bubble'],
  },

  usage: {
    when: [
      'Displaying individual messages in a chat interface',
      'Building AI assistant or chatbot UIs',
      'Need role-based message styling (user vs assistant)',
      'Messages need actions like copy, regenerate, or feedback',
    ],
    whenNot: [
      'Simple text display without chat context (use Text)',
      'Notification-style messages (use Alert or Toast)',
      'Comment threads with nested replies (use Card with custom layout)',
    ],
    guidelines: [
      'Always provide a role prop to determine styling',
      'Use status prop to show message state (sending, streaming, error)',
      'Consider showing timestamps for longer conversations',
      'Provide hover actions for assistant messages (copy, regenerate)',
    ],
    accessibility: [
      'Uses semantic HTML for message structure',
      'Role-based styling has sufficient color contrast',
      'Actions are keyboard accessible',
      'Streaming indicator respects reduced motion preferences',
    ],
  },

  props: {
    role: {
      type: 'enum',
      values: ['user', 'assistant', 'system'],
      description: 'Message role determines styling and alignment',
      required: true,
    },
    children: {
      type: 'node',
      description: 'Message content',
      required: true,
    },
    status: {
      type: 'enum',
      values: ['sending', 'streaming', 'complete', 'error'],
      default: '"complete"',
      description: 'Message state',
    },
    timestamp: {
      type: 'custom',
      description: 'When the message was sent',
    },
    avatar: {
      type: 'node',
      description: 'Custom avatar override (null to hide)',
    },
    'Avatar.src': {
      type: 'string',
      description: 'Image URL for the avatar (on Message.Avatar sub-component)',
    },
    'Avatar.alt': {
      type: 'string',
      description: 'Alt text for image avatars (on Message.Avatar sub-component)',
    },
    actions: {
      type: 'node',
      description: 'Hover actions (copy, regenerate)',
    },
  },

  relations: [
    {
      component: 'ConversationList',
      relationship: 'parent',
      note: 'Messages are typically used within ConversationList',
    },
    {
      component: 'Avatar',
      relationship: 'child',
      note: 'Use Avatar component for custom avatar content',
    },
    {
      component: 'ThinkingIndicator',
      relationship: 'sibling',
      note: 'Show ThinkingIndicator while awaiting assistant response',
    },
  ],

  contract: {
    propsSummary: [
      'role: "user" | "assistant" | "system" - determines styling',
      'children: ReactNode - message content',
      'status: "sending" | "streaming" | "complete" | "error" - message state',
      'timestamp: Date - when message was sent',
      'avatar: ReactNode - custom avatar (null to hide)',
      'actions: ReactNode - hover actions',
      'Avatar.src: string - image URL for avatar',
      'Avatar.alt: string - alt text for image avatar',
    ],
    scenarioTags: [
      'ui.chat',
      'ui.message',
      'ai.conversation',
      'ai.assistant',
    ],
    a11yRules: [
      'A11Y_COLOR_CONTRAST',
      'A11Y_MOTION_PREFERENCE',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'User Message',
      description: 'Message from the user (right-aligned)',
      render: () => (
        <Message role="user">
          <Message.Content>
            Hello! Can you help me with a coding question?
          </Message.Content>
        </Message>
      ),
    },
    {
      name: 'Assistant Message',
      description: 'Response from the AI assistant',
      render: () => (
        <Message role="assistant">
          <Message.Content>
            Of course! I'd be happy to help. What would you like to know?
          </Message.Content>
        </Message>
      ),
    },
    {
      name: 'System Message',
      description: 'System notification or context',
      render: () => (
        <Message role="system">
          <Message.Content>
            Conversation started. Model: GPT-4
          </Message.Content>
        </Message>
      ),
    },
    {
      name: 'Streaming',
      description: 'Message being streamed (with cursor)',
      render: () => (
        <Message role="assistant" status="streaming">
          <Message.Content>
            I'm currently generating a response for you
          </Message.Content>
        </Message>
      ),
    },
    {
      name: 'With Timestamp',
      description: 'Message with timestamp display',
      render: () => (
        <Message role="assistant" timestamp={new Date(Date.now() - 300000)}>
          <Message.Content>
            This message was sent 5 minutes ago.
          </Message.Content>
          <Message.Timestamp />
        </Message>
      ),
    },
    {
      name: 'Error State',
      description: 'Message that failed to send',
      render: () => (
        <Message role="user" status="error">
          <Message.Content>
            This message failed to send.
          </Message.Content>
        </Message>
      ),
    },
    {
      name: 'Custom Avatars',
      description: 'Messages with image-based avatars',
      render: () => (
        <>
          <Message
            role="user"
            avatar={<Message.Avatar src="https://i.pravatar.cc/64?u=user" alt="Jane" />}
          >
            <Message.Content>
              Can you help me understand this error?
            </Message.Content>
          </Message>
          <Message
            role="assistant"
            avatar={<Message.Avatar src="https://i.pravatar.cc/64?u=bot" alt="AI Assistant" />}
          >
            <Message.Content>
              Sure! Let me take a look at that for you.
            </Message.Content>
          </Message>
        </>
      ),
    },
    {
      name: 'With Actions',
      description: 'Message with hover actions',
      render: () => (
        <Message
          role="assistant"
          actions={
            <>
              <button style={{ padding: '4px 8px', fontSize: '12px' }}>Copy</button>
              <button style={{ padding: '4px 8px', fontSize: '12px' }}>Regenerate</button>
            </>
          }
        >
          <Message.Content>
            Hover over this message to see the actions.
          </Message.Content>
        </Message>
      ),
    },
  ],
});
