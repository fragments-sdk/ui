import React from 'react';
import { defineFragment } from '@fragments/core';
import { ConversationList } from '.';
import { Message } from '../Message';

export default defineFragment({
  component: ConversationList,

  meta: {
    name: 'ConversationList',
    description: 'Scrollable message container with auto-scroll and history loading',
    category: 'ai',
    status: 'stable',
    tags: ['conversation', 'chat', 'messages', 'scroll', 'ai', 'list'],
  },

  usage: {
    when: [
      'Building a chat interface with multiple messages',
      'Need auto-scroll behavior when new messages arrive',
      'Require infinite scroll for loading message history',
      'Want date separators between message groups',
    ],
    whenNot: [
      'Simple list of items without chat context (use List)',
      'Single message display (use Message directly)',
      'Non-scrolling message layout',
    ],
    guidelines: [
      'Use autoScroll="smart" for best UX (only auto-scrolls when near bottom)',
      'Implement onScrollTop for loading older messages',
      'Provide an emptyState for new conversations',
      'Use DateSeparator between messages from different days',
    ],
    accessibility: [
      'Uses proper ARIA roles for separators',
      'Typing indicator has aria-label',
      'Smooth scroll respects reduced motion preferences',
      'Keyboard navigation works within scrollable container',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'Message components',
      required: true,
    },
    autoScroll: {
      type: 'union',
      default: '"smart"',
      description: 'Auto-scroll behavior: true (always), false (never), or "smart" (only when near bottom)',
    },
    onScrollTop: {
      type: 'function',
      description: 'Callback when user scrolls to top (for loading history)',
    },
    loadingHistory: {
      type: 'boolean',
      default: 'false',
      description: 'Show loading spinner at top when loading history',
    },
    emptyState: {
      type: 'node',
      description: 'Content to show when conversation is empty',
    },
    scrollTopThreshold: {
      type: 'number',
      default: '50',
      description: 'Pixels from top to trigger onScrollTop',
    },
    scrollBottomThreshold: {
      type: 'number',
      default: '100',
      description: 'Pixels from bottom for smart auto-scroll',
    },
  },

  relations: [
    {
      component: 'Message',
      relationship: 'child',
      note: 'ConversationList contains Message components',
    },
    {
      component: 'ThinkingIndicator',
      relationship: 'child',
      note: 'Show ThinkingIndicator at bottom while awaiting response',
    },
    {
      component: 'Prompt',
      relationship: 'sibling',
      note: 'Typically paired with Prompt for input',
    },
  ],

  contract: {
    propsSummary: [
      'children: ReactNode - Message components',
      'autoScroll: boolean | "smart" - scroll behavior (default: "smart")',
      'onScrollTop: () => void - callback for loading history',
      'loadingHistory: boolean - show history loading spinner',
      'emptyState: ReactNode - empty conversation content',
    ],
    scenarioTags: [
      'ui.chat',
      'ui.conversation',
      'ai.assistant',
      'layout.scroll',
    ],
    a11yRules: [
      'A11Y_ARIA_ROLES',
      'A11Y_MOTION_PREFERENCE',
    ],
    bans: [],
  },

  variants: [
    {
      name: 'Basic',
      description: 'Simple conversation with messages',
      render: () => (
        <div style={{ height: '300px', border: '1px solid #e4e4e7', borderRadius: '8px' }}>
          <ConversationList>
            <Message role="user">
              <Message.Content>Hello!</Message.Content>
            </Message>
            <Message role="assistant">
              <Message.Content>Hi there! How can I help you today?</Message.Content>
            </Message>
            <Message role="user">
              <Message.Content>Can you explain React hooks?</Message.Content>
            </Message>
          </ConversationList>
        </div>
      ),
    },
    {
      name: 'With Date Separators',
      description: 'Messages grouped by date',
      render: () => (
        <div style={{ height: '300px', border: '1px solid #e4e4e7', borderRadius: '8px' }}>
          <ConversationList>
            <ConversationList.DateSeparator date={new Date(Date.now() - 86400000)} />
            <Message role="user">
              <Message.Content>A message from yesterday</Message.Content>
            </Message>
            <ConversationList.DateSeparator date={new Date()} />
            <Message role="assistant">
              <Message.Content>And a message from today!</Message.Content>
            </Message>
          </ConversationList>
        </div>
      ),
    },
    {
      name: 'With Typing Indicator',
      description: 'Shows assistant is typing',
      render: () => (
        <div style={{ height: '300px', border: '1px solid #e4e4e7', borderRadius: '8px' }}>
          <ConversationList>
            <Message role="user">
              <Message.Content>What is TypeScript?</Message.Content>
            </Message>
            <ConversationList.TypingIndicator name="Assistant" />
          </ConversationList>
        </div>
      ),
    },
    {
      name: 'Loading History',
      description: 'Loading older messages',
      render: () => (
        <div style={{ height: '300px', border: '1px solid #e4e4e7', borderRadius: '8px' }}>
          <ConversationList loadingHistory>
            <Message role="user">
              <Message.Content>This is the latest message</Message.Content>
            </Message>
          </ConversationList>
        </div>
      ),
    },
    {
      name: 'Empty State',
      description: 'No messages yet',
      render: () => (
        <div style={{ height: '300px', border: '1px solid #e4e4e7', borderRadius: '8px' }}>
          <ConversationList
            emptyState={
              <div style={{ textAlign: 'center', color: '#71717a', padding: '2rem' }}>
                <p>No messages yet</p>
                <p style={{ fontSize: '12px' }}>Start a conversation!</p>
              </div>
            }
          >
            {/* No messages */}
          </ConversationList>
        </div>
      ),
    },
  ],
});
