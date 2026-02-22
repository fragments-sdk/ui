import { defineBlock } from '@fragments-sdk/core';

export default defineBlock({
  name: 'Command Palette',
  description: 'Modal command palette for quick actions, composed with Dialog and Command',
  category: 'navigation',
  components: ['Dialog', 'Command'],
  tags: ['command', 'palette', 'search', 'spotlight', 'quick-actions'],
  code: `
<Dialog>
  <Dialog.Trigger asChild>
    <Button variant="secondary">Open Command Palette</Button>
  </Dialog.Trigger>
  <Dialog.Content size="sm">
    <Command>
      <Command.Input placeholder="Search commands..." />
      <Command.List>
        <Command.Group heading="Actions">
          <Command.Item onItemSelect={() => console.log('new')}>New File</Command.Item>
          <Command.Item onItemSelect={() => console.log('open')}>Open Recent</Command.Item>
          <Command.Item onItemSelect={() => console.log('save')}>Save All</Command.Item>
        </Command.Group>
        <Command.Separator />
        <Command.Group heading="Settings">
          <Command.Item onItemSelect={() => console.log('prefs')}>Preferences</Command.Item>
          <Command.Item onItemSelect={() => console.log('keys')}>Keyboard Shortcuts</Command.Item>
        </Command.Group>
        <Command.Empty>No results found.</Command.Empty>
      </Command.List>
    </Command>
  </Dialog.Content>
</Dialog>
`.trim(),
});
