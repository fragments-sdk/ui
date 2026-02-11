import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Empty State',
  description: 'Placeholder with icon, message, and action when no content exists',
  category: 'dashboard',
  components: ['EmptyState', 'Button'],
  tags: ['empty', 'placeholder', 'zero-state', 'no-data'],
  code: `
<EmptyState>
  <EmptyState.Icon>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 8v13H3V8M1 3h22v5H1zM10 12h4" />
    </svg>
  </EmptyState.Icon>
  <EmptyState.Title>No items yet</EmptyState.Title>
  <EmptyState.Description>Get started by creating your first item.</EmptyState.Description>
  <EmptyState.Actions>
    <Button variant="primary">Create Item</Button>
  </EmptyState.Actions>
</EmptyState>
`.trim(),
});
