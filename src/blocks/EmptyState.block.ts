import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Empty State',
  description: 'Placeholder when no content or data exists',
  category: 'dashboard',
  components: ['EmptyState', 'Button'],
  tags: ['empty', 'placeholder', 'zero-state', 'dashboard'],
  code: `
<EmptyState>
  <EmptyState.Icon>
    <InboxIcon />
  </EmptyState.Icon>
  <EmptyState.Title>No items yet</EmptyState.Title>
  <EmptyState.Description>Get started by creating your first item.</EmptyState.Description>
  <EmptyState.Actions>
    <Button variant="primary">Create Item</Button>
  </EmptyState.Actions>
</EmptyState>
`.trim(),
});
