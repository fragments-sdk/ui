import { defineBlock } from '@fragments-sdk/cli/core';

export default defineBlock({
  name: 'Settings Drawer',
  description: 'Side panel for editing settings with form fields and save/cancel actions',
  category: 'settings',
  components: ['Drawer', 'Form', 'Field', 'Button', 'Switch'],
  tags: ['drawer', 'settings', 'form', 'panel', 'editor'],
  code: `
<Drawer>
  <Drawer.Trigger asChild>
    <Button variant="secondary">Settings</Button>
  </Drawer.Trigger>
  <Drawer.Content size="md">
    <Drawer.Close />
    <Drawer.Header>
      <Drawer.Title>Settings</Drawer.Title>
      <Drawer.Description>Manage your preferences.</Drawer.Description>
    </Drawer.Header>
    <Drawer.Body>
      <Form>
        <Stack gap="md">
          <Field>
            <Field.Label>Display Name</Field.Label>
            <Field.Control>
              <Input placeholder="Enter name" />
            </Field.Control>
          </Field>
          <Field>
            <Field.Label>Email Notifications</Field.Label>
            <Field.Control>
              <Switch defaultChecked />
            </Field.Control>
          </Field>
        </Stack>
      </Form>
    </Drawer.Body>
    <Drawer.Footer>
      <Drawer.Close asChild>
        <Button variant="secondary">Cancel</Button>
      </Drawer.Close>
      <Button variant="primary">Save Changes</Button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer>
`.trim(),
});
