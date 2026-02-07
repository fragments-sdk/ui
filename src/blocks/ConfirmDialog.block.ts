import { defineBlock } from '@fragments/core';

export default defineBlock({
  name: 'Confirm Dialog',
  description: 'Confirmation dialog with destructive action warning',
  category: 'overlays',
  components: ['Dialog', 'Button'],
  tags: ['confirm', 'dialog', 'modal', 'destructive'],
  code: `
<Dialog open={isOpen} onClose={onClose}>
  <Dialog.Title>{title}</Dialog.Title>
  <Dialog.Description>{description}</Dialog.Description>
  <Dialog.Actions>
    <Button variant="secondary" onClick={onClose}>Cancel</Button>
    <Button variant="danger" onClick={onConfirm}>Confirm</Button>
  </Dialog.Actions>
</Dialog>
`.trim(),
});
