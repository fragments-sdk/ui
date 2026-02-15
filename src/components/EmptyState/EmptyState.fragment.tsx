import React from 'react';
import { defineFragment } from '@fragments-sdk/cli/core';
import { EmptyState } from '.';
import { Button } from '../Button';

// Simple placeholder icon
const FolderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const InboxIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </svg>
);

export default defineFragment({
  component: EmptyState,

  meta: {
    name: 'EmptyState',
    description: 'Placeholder for empty content areas. Provides context, guidance, and actions when no data is available.',
    category: 'feedback',
    status: 'stable',
    tags: ['empty', 'placeholder', 'no-data', 'zero-state', 'blank-slate'],
    since: '0.1.0',
  },

  usage: {
    when: [
      'Empty lists, tables, or search results',
      'New user onboarding (no content yet)',
      'Filtered views with no matches',
      'Error states where content failed to load',
    ],
    whenNot: [
      'Loading states (use skeleton or spinner)',
      'Error messages with retry (use Alert)',
      'Temporary messages (use Toast)',
    ],
    guidelines: [
      'Always explain why the area is empty',
      'Provide a clear action to resolve the empty state',
      'Use appropriate icons to reinforce the message',
      'Keep messaging positive and actionable',
    ],
    accessibility: [
      'Empty state content is accessible to screen readers',
      'Action buttons follow button accessibility guidelines',
    ],
  },

  props: {
    children: {
      type: 'node',
      description: 'EmptyState content - use EmptyState.Icon, EmptyState.Title, EmptyState.Description, EmptyState.Actions sub-components',
    },
    size: {
      type: 'enum',
      description: 'Size variant',
      values: ['sm', 'md', 'lg'],
      default: 'md',
    },
  },

  relations: [
    { component: 'Alert', relationship: 'alternative', note: 'Use Alert for error states with retry' },
    { component: 'Progress', relationship: 'alternative', note: 'Use Progress/Spinner for loading states' },
  ],

  contract: {
    propsSummary: [
      'size: sm|md|lg (default: md)',
      'Sub-components: EmptyState.Icon, EmptyState.Title, EmptyState.Description, EmptyState.Actions',
    ],
    scenarioTags: [
      'feedback.empty',
      'onboarding.start',
      'search.no-results',
    ],
    a11yRules: ['A11Y_EMPTY_STATE_CONTENT'],
  },

  ai: {
    compositionPattern: 'compound',
    subComponents: ['Icon', 'Title', 'Description', 'Actions'],
    requiredChildren: ['Title'],
    commonPatterns: [
      '<EmptyState><EmptyState.Title>{title}</EmptyState.Title><EmptyState.Description>{description}</EmptyState.Description></EmptyState>',
      '<EmptyState><EmptyState.Icon>{icon}</EmptyState.Icon><EmptyState.Title>{title}</EmptyState.Title><EmptyState.Description>{description}</EmptyState.Description><EmptyState.Actions><Button>{action}</Button></EmptyState.Actions></EmptyState>',
    ],
  },

  variants: [
    {
      name: 'Default',
      description: 'Basic empty state with action',
      render: () => (
        <EmptyState>
          <EmptyState.Icon><FolderIcon /></EmptyState.Icon>
          <EmptyState.Title>No projects yet</EmptyState.Title>
          <EmptyState.Description>Get started by creating your first project.</EmptyState.Description>
          <EmptyState.Actions>
            <Button>Create Project</Button>
          </EmptyState.Actions>
        </EmptyState>
      ),
    },
    {
      name: 'No Results',
      description: 'Empty search results',
      render: () => (
        <EmptyState>
          <EmptyState.Icon><SearchIcon /></EmptyState.Icon>
          <EmptyState.Title>No results found</EmptyState.Title>
          <EmptyState.Description>Try adjusting your search terms or filters.</EmptyState.Description>
          <EmptyState.Actions>
            <Button variant="secondary">Clear Filters</Button>
          </EmptyState.Actions>
        </EmptyState>
      ),
    },
    {
      name: 'With Secondary Action',
      description: 'Empty state with two actions',
      render: () => (
        <EmptyState>
          <EmptyState.Icon><InboxIcon /></EmptyState.Icon>
          <EmptyState.Title>Inbox is empty</EmptyState.Title>
          <EmptyState.Description>You have no new messages.</EmptyState.Description>
          <EmptyState.Actions>
            <Button>Compose Message</Button>
            <Button variant="secondary">View Archive</Button>
          </EmptyState.Actions>
        </EmptyState>
      ),
    },
    {
      name: 'Small',
      description: 'Compact empty state for inline use',
      render: () => (
        <EmptyState size="sm">
          <EmptyState.Title>No items</EmptyState.Title>
          <EmptyState.Description>Add items to see them here.</EmptyState.Description>
        </EmptyState>
      ),
    },
    {
      name: 'Large',
      description: 'Prominent empty state for full-page use',
      render: () => (
        <EmptyState size="lg">
          <EmptyState.Icon><FolderIcon /></EmptyState.Icon>
          <EmptyState.Title>Welcome to your workspace</EmptyState.Title>
          <EmptyState.Description>
            This is where your projects will appear. Create your first project to get started.
          </EmptyState.Description>
          <EmptyState.Actions>
            <Button>Create Your First Project</Button>
          </EmptyState.Actions>
        </EmptyState>
      ),
    },
  ],
});
