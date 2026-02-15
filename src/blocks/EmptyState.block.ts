import { defineBlock } from '@fragments-sdk/cli/core';

export default defineBlock({
  name: 'Empty State',
  description: 'Placeholder with icon, message, and action when no content exists',
  category: 'dashboard',
  components: ['EmptyState', 'Icon', 'Button'],
  tags: ['empty', 'placeholder', 'zero-state', 'no-data'],
  code: `
import { ArchiveBox } from '@phosphor-icons/react';

<EmptyState>
  <EmptyState.Icon>
    <Icon icon={ArchiveBox} size="xl" />
  </EmptyState.Icon>
  <EmptyState.Title>No items yet</EmptyState.Title>
  <EmptyState.Description>Get started by creating your first item.</EmptyState.Description>
  <EmptyState.Actions>
    <Button variant="primary">Create Item</Button>
  </EmptyState.Actions>
</EmptyState>
`.trim(),
});
